import { config } from "./core/config";
config();

import { connect } from "./core/redis";
import { sequelize, setup } from "./core/sequelize";

// Init redis and sequelize
// connect().then(setup);

import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

import router from "./routes";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());

app.use(
  '/api/vlayer',
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/vlayer': '/api',
    },
    timeout: 1000 * 60,
  })
);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", router);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
