import crypto from "crypto";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import {client} from "./redis";

export const arweave = Arweave.init({
  host: process.env.ARWEAVE_HOST || "arweave.net", // Hostname or IP address for a Arweave host
  port: process.env.ARWEAVE_PORT || 443, // Port
  protocol: process.env.ARWEAVE_PROTOCOL || "https", // Network protocol http or https
});

type ARUploadStatus = {
  status: number;
  statusText: string;
  data: any;
};
class ARUploadError extends Error {
  constructor(public status: ARUploadStatus) {
    super(`Failed to upload data to Arweave: ${status.statusText}`);
  }
}

export const arHost = arweave.getConfig().api.host;

export const arWallet: JWKInterface = JSON.parse(process.env.ARWEAVE_KEY!);

const getDataHashKey = (hash: string) => `arweave:hash:${hash}`;
// 计算数据的哈希值
const calculateHash = (data: Buffer) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

export const uploadData = async (
  data: Buffer,
  tags: Record<string, string>,
  useCache = true,
  onFailError = true,
) => {
  const dataHash = calculateHash(data);
  const cacheKey = getDataHashKey(dataHash);

  if (useCache) {
    const cachedRes = await client.get(cacheKey);
    if (cachedRes) {
      console.log("Using cached data");
      return JSON.parse(cachedRes);
    }
  }

  const transaction = await arweave.createTransaction({ data }, arWallet);
  Object.entries(tags).forEach(([key, value]) => {
    transaction.addTag(key, value);
  });

  await arweave.transactions.sign(transaction, arWallet);
  const status = await arweave.transactions.post(transaction);

  if (onFailError && status.status != 200) throw new ARUploadError(status);

  const res = { transaction, status };

  if (status.status == 200) // 仅在成功时缓存
    await client.set(cacheKey, JSON.stringify(res));

  return res;
};

export const uploadFile = async (
  file: Express.Multer.File,
  useCache = true,
  onFailError = true,
) => {
  return uploadData(
    file.buffer,
    { "Content-Type": file.mimetype },
    useCache,
    onFailError,
  );
};
export const uploadString = async (
  data: string, useCache = true, onFailError = true
) => {
  return uploadData(
    Buffer.from(data),
    { "Content-Type": "text/plain" },
    useCache,
    onFailError,
  );
};
export const uploadJSON = async (
  data: any, useCache = true, onFailError = true
) => {
  return uploadData(
    Buffer.from(JSON.stringify(data)),
    { "Content-Type": "application/json" },
    useCache,
    onFailError,
  );
};
