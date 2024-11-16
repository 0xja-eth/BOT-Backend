import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export function config() {
  const mainEnv = process.env.MAIN_ENV || "";
  const rootEnvChain = process.env.CHAIN;

  const appDirectory = fs.realpathSync(process.cwd());
  const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
  const pathsDotenv = resolveApp(`.env${mainEnv ? `.${mainEnv}` : ""}`);

  dotenv.config({ path: `${pathsDotenv}` });

  const envChain = rootEnvChain || process.env.CHAIN;
  const chainDotenv = resolveApp(`env/${envChain}.env`);

  dotenv.config({ path: `${chainDotenv}` });

  console.log("Main Env: ", mainEnv, "Chain: ", envChain, process.env);
}
