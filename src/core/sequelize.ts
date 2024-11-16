import { Column, DataType, ModelCtor, Sequelize } from "sequelize-typescript";
import process from "process";
import { TextLength } from "sequelize";
import SnowflakeId from "snowflake-id";
import { ModelStatic } from "sequelize-typescript";
import { BeforeCreate } from "sequelize-typescript/dist/hooks/single/before/before-create";
import { data2Str, str2Data } from "../utils/json";
import { Dialect } from "sequelize/types/sequelize";

export function JSONColumn<T = any>(
  objOrLength: TextLength | object,
  keyOrGetWrapper?: ((res: T | any) => T) | string,
  setWrapper?: (res: T) => T | any,
) {
  const flag =
    typeof objOrLength == "string" || keyOrGetWrapper instanceof Function;

  const length = (flag && objOrLength) as TextLength;
  const getWrapper = flag && (keyOrGetWrapper as (res: T | any) => T);
  const obj = !flag && objOrLength;
  const key = !flag && keyOrGetWrapper;

  const process = (obj, key) =>
    Column({
      type: DataType.TEXT(length),
      set(this, val: T) {
        val = setWrapper ? setWrapper(val) : val;
        this.setDataValue(key, data2Str(val));
      },
      get(this): T {
        let str, res: T;
        try {
          str = this.getDataValue(key);
          res = str2Data(str);
        } catch (e) {
          console.error(`JSON Field: "${key}" error!`, str, e);
        }
        return getWrapper ? getWrapper(res) : res;
      },
    })(obj, key);

  return flag ? process : process(obj, key);
}

export function DateTimeColumn(obj, key) {
  return Column({
    type: DataType.DATE,
    get(this) { return (new Date(this.getDataValue(key))).getTime() }
  })(obj, key)
}

const models: {[K in string]: ModelCtor[]} = {};
export function model(keyOrClazz: string | ModelCtor = "default") {
  if (typeof keyOrClazz !== "string") // clazz
    return model("default")(keyOrClazz);

  return (clazz: ModelCtor) => {
    models[keyOrClazz] ||= []
    models[keyOrClazz].push(clazz);
  }
}

export const snowflake = new SnowflakeId({
  custom_epoch: 1658291243929,
  instance_id: 1,
});

export function snowflakeModel(idKeyOrClazz: string | ModelStatic | any) {
  if (idKeyOrClazz instanceof Function)
    return snowflakeModel("id")(idKeyOrClazz);

  return (clazz) => {
    clazz["setSnowflake"] = function (instance) {
      instance[idKeyOrClazz || "id"] = snowflake.generate();
      console.log("BeforeCreate", clazz, instance);
    };
    BeforeCreate(clazz, "setSnowflake");
  };
}

// let _sequelize;
const sequelizes = {};

export const sequelize = (key = "default") =>
  (sequelizes[key] ||= new Sequelize(getSequelizeConfig(key)));

function getSequelizeConfig(key = "default") {
  key = key.toLowerCase();

  const suffix = key == "default" ? "" : `_${key.toUpperCase()}`;
  console.log(`Loaded ${key} models: `, models[key].map(m => m.name));

  return {
    dialect: (process.env[`DB_DIALECT${suffix}`] as Dialect) || "mysql",
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
      // prepare: false,
      connectTimeout: 180000,
    },
    pool: { max: 20, min: 2, idle: 30000, acquire: 30000 },
    host: process.env[`DB_HOST${suffix}`],
    port: Number(process.env[`DB_PORT${suffix}`]),
    username: process.env[`DB_USERNAME${suffix}`],
    password: process.env[`DB_PASSWORD${suffix}`],
    database: process.env[`DB_NAME${suffix}`],
    // logging: console.log,
    logging: false,
    models: models[key] || [],
  };
}

export async function sync(key = "default") {
  await sequelize(key).sync({ alter: true });
}

export function setup() {
  const dbs = Object.keys(process.env).filter(k => k.startsWith("DB_HOST"))
    .map(k => k.split("_")[2] || "default")
    // .filter(k => !!k)

  console.log("Setup DBs:", dbs)
  for (const db of dbs) sequelize(db)
}
