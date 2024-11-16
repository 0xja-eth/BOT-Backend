import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * 验证Solana签名
 * @param message - 要验证的消息
 * @param signatureBase64 - Base64编码的签名
 * @param pubKeyBase58 - Base58编码的公钥
 * @returns boolean - 签名是否有效
 */
export const verifySignature = (
  message: string,
  signatureBase64: string,
  pubKeyBase58: string,
): boolean => {
  try {
    // 将公钥从Base58字符串解码为字节数组
    const pubKeyUint8Array = bs58.decode(pubKeyBase58);

    // 将签名从Base64字符串解码为字节数组
    const signatureUint8Array = Buffer.from(signatureBase64, "base64");

    // 将消息编码为字节数组
    const messageUint8Array = new TextEncoder().encode(message);

    // 使用nacl库的ed25519.verify方法验证签名
    return nacl.sign.detached.verify(
      messageUint8Array,
      signatureUint8Array,
      pubKeyUint8Array,
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
};
