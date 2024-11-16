import * as fs from "fs";
import * as path from "path";
import {Contract, ethers, Wallet} from "ethers";
import {ContractInterface} from "@ethersproject/contracts";
import {Provider} from "@ethersproject/abstract-provider/src.ts/index";
import {TransactionResponse} from "@ethersproject/abstract-provider";

export type ContractInfo = {
  "contractName": string,
  "sourceName": string,
  "abi": ContractInterface,
  "bytecode": string,
  "deployedBytecode": string,
  "linkReferences": any,
  "deployedLinkReferences": any
}

const ArtifactsPath = process.env.ARTIFACTS_PATH || './artifacts';

function findAndLoadContractFile(contractName: string): string | null {
  const contractsPath = path.join(ArtifactsPath, 'src');

  function searchDirectory(directory: string): string | null {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const result = searchDirectory(path.join(directory, file.name));
        if (result) return result;
      } else if (file.isFile() && file.name === `${contractName}.json`) {
        return fs.readFileSync(path.join(directory, file.name), { encoding: 'utf-8' });
      }
    }
    return null;
  }

  return searchDirectory(contractsPath);
}

export function env() {
  return process.env.DEFAULT_ENV || 'test';
}
export function chainId() {
  return Number(process.env[`${env().toUpperCase()}NET_CHAIN_ID`])
}
export function rpcUrl() {
  return process.env[`${env().toUpperCase()}NET_RPC_URL`]
}

let _provider: Provider;
export function provider() {
  return _provider ||= new ethers.providers.JsonRpcProvider(rpcUrl(), chainId());
}

// Load private key from environment
const PRIVATE_KEY = process.env[`${env().toUpperCase()}NET_PRIVATE_KEY`];
if (!PRIVATE_KEY) {
  console.warn('Private key is not set in the environment variables.');
}
// Create a wallet instance with the private key
let _signer: Wallet;
// Function to get a signer (wallet) connected to the provider
export function signer() {
  if (!_signer) {
    _signer = new ethers.Wallet(PRIVATE_KEY, provider());
  }
  return _signer;
}

export function getContractInfo(contractName: string) {
  const contractData = findAndLoadContractFile(contractName);
  return JSON.parse(contractData) as ContractInfo;
}
export function getABI(contractName: string) {
  return getContractInfo(contractName)?.abi;
}
export function getBytecode(contractName: string) {
  return getContractInfo(contractName)?.bytecode;
}

const RetryCount = 5;

const DefaultConfirmations = 3;

// export type Network = "dev" | "scripts" | "main";
export type ContractCache = {
  [ChainId in number]: {[CacheName: string]: string}
  // {[ChainId]: {[CacheName]: Address}}
}
const ContractCacheFile = process.env.CONTRACT_CACHE_FILE;

let _contractData: ContractCache;
export function getContractCache() {
  if (!_contractData)
    try {
      _contractData = JSON.parse(fs.readFileSync(ContractCacheFile, "utf-8"));
    } catch (e) {
      console.error("Get ContractData Error!", e);
      _contractData = {}
    }
  return _contractData;
}
export function getAddress(chainId: number, name: string) {
  return getContractCache()[chainId]?.[name];
}
export function saveAddress(chainId: number, name: string, address: string) {
  const contractCache = getContractCache();
  contractCache[chainId] ||= {};
  contractCache[chainId][name] = address;
  saveContractCache();
}
export function saveContractCache() {
  fs.writeFileSync(ContractCacheFile, JSON.stringify(_contractData, undefined, 2))
}

// export async function deployContract(
//   name: string, args: any[] = [], cacheName?: string,
//   label?: string, confirmations = DefaultConfirmations): Promise<Contract> {
//   cacheName ||= name;
//
//   // TODO
// }

export async function getContract(name: string, cacheName?: string, address?: string) {
  const res = await findContract(name, cacheName, address);
  const nameStr = cacheName == name ? name : `${cacheName}(${name})`;
  if (!res) throw `${nameStr} is not found!`
  return res;
}
export async function saveContract(name: string, address: string, cacheName?: string) {
  const res = await findContract(name, cacheName, address);

  saveAddress(chainId(), cacheName || name, address);

  return res;
}
export async function findContract(name: string, cacheName?: string, address?: string) {
  cacheName ||= name;
  const nameStr = cacheName == name ? name : `${cacheName}(${name})`;
  // console.info(`Getting ${nameStr} from ${address || "cache"}`)

  const hasAddress = !!address;
  address ||= getAddress(chainId(), cacheName);

  if (!address) return null;
  // if (!hasAddress) console.log(`... Cached address of ${nameStr} is ${address}`);

  const contractInfo = getContractInfo(name);
  const res = new ethers.Contract(address, contractInfo.abi, provider());

  // console.info(`... Completed!`);

  return signer() ? res.connect(signer()) : res;
}
// export async function getOrDeployContract(
//   name: string, cacheNameOrArgs?: string | any[], args?: any[]): Promise<[Contract, boolean]> {
//   args = cacheNameOrArgs instanceof Array ? cacheNameOrArgs : args;
//   const cacheName = typeof cacheNameOrArgs == "string" ? cacheNameOrArgs : name;
//
//   const nameStr = cacheName == name ? name : `${cacheName}(${name})`;
//   console.info(`Getting ${nameStr} from cache, deploy if not exist`)
//
//   const address = getAddress(chainId(), cacheName);
//   if (!address) return [await deployContract(name, args, cacheName), true];
//   console.log(`... Cached address of ${nameStr} is ${address}`);
//
//   const contractInfo = getContractInfo(name);
//   const res = new ethers.Contract(address, contractInfo.abi, provider());
//
//   console.info(`... Completed!`);
//
//   return [res, false];
// }

// Make = Get or deploy
// export async function makeContract(
//   name: string, forceDeployOrCacheNameOrArgs: boolean | string | any[] = false,
//   forceDeployOrArgs: boolean | any[] = false, forceDeploy = false): Promise<[Contract, boolean]> {
//   const cacheName = typeof forceDeployOrCacheNameOrArgs == "string" ?
//     forceDeployOrCacheNameOrArgs : name;
//   const args = forceDeployOrCacheNameOrArgs instanceof Array ?
//     forceDeployOrCacheNameOrArgs :
//     forceDeployOrArgs instanceof Array ?
//       forceDeployOrArgs : [];
//   forceDeploy = typeof forceDeployOrCacheNameOrArgs == "boolean" ?
//     forceDeployOrCacheNameOrArgs :
//     typeof forceDeployOrArgs == "boolean" ?
//       forceDeployOrArgs : forceDeploy;
//
//   return forceDeploy ?
//     [await deployContract(name, args, cacheName), true] :
//     getOrDeployContract(name, cacheName, args);
// }

export async function sendTx(
  txPromise: Promise<TransactionResponse> | (() => Promise<TransactionResponse>),
  label?: string, confirmations = DefaultConfirmations) {
  if (txPromise instanceof Function) {
    let cnt = 0;
    while (true) {
      try {
        return await sendTx(txPromise(), label, confirmations);
      } catch (e) {
        console.error("... Error!", e);
        if (++cnt < RetryCount)
          console.info(`Retrying... (${cnt}/${RetryCount})`);
        else {
          console.error(`No retry count! Transaction is failed!`);
          throw e;
        }
      }
    }
  } else {
    console.info(`Sending ${label}...`)
    const res = await txPromise;
    await res.wait(confirmations)
    console.info(`... Sent! ${res.hash}`)
    return res
  }
}

export function addrEq(a: string, b: string) {
  return a?.toLowerCase() == b?.toLowerCase();
}
