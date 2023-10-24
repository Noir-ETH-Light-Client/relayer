import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import logger from "./logger.js";
import mongoose from "mongoose";
import { CronJob } from "cron";
import { lcUpdate, updateStatusLcUpdate } from "./lc-update.js";
import { getLCProof, getLCStore, getLCUpdates } from "./controller.js";
// import { boostrap } from "./boostrap.js";
import { Contract, ethers } from "ethers";
import artifact from "./abi/LightClientStore.json" assert { type: "json" };

dotenv.config();

export const provider: any = ethers.getDefaultProvider(process.env.PROVIDER || "https://goerli.infura.io/v3/");
export const contract: Contract = new ethers.Contract(process.env.CONTRACTADDR || "0x2d2BF2cB1d727dBB7E5192b04ABD646b0CbEA15d", artifact.abi, provider);
class Server {
  public app: express.Application;
  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.mongo();
    // setupGlobalVariables();
  }

  public routes(): void {
    this.app.use("/api/v1/store", getLCStore);
    this.app.use("/api/v1/update/:signatureSlot", getLCUpdates);
    this.app.use("/api/v1/proof/:lcUpdateId", getLCProof);
  }

  public config(): void {
    this.app.set("port", process.env.PORT || 3000);
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: "50mb",
        parameterLimit: 1000000,
      })
    );
    this.app.use(compression());
    this.app.use(cors());

    const myStream = {
      write: (text: any) => {
        logger.info(text);
      },
    };
    this.app.use(morgan("dev", { stream: myStream }));
    // this.app.use(logger('[:date[web]] | :method :url | :status | :response-time ms'));
  }

  private mongo(): void {
    const connection = mongoose.connection;
    connection.on("connected", () => {
      logger.info("Mongo Connection Established");
    });
    connection.on("reconnected", () => {
      logger.info("Mongo Connection Reestablished");
    });
    connection.on("disconnected", () => {
      logger.info("Mongo Connection Disconnected");
      logger.info("Trying to reconnect to Mongo ...");
      setTimeout(() => {
        mongoose.connect(process.env.MONGODB_URI!, {
          keepAlive: true,
        });
      }, 3000);
    });
    connection.on("close", () => {
      logger.info("Mongo Connection Closed");
    });
    connection.on("error", (error: Error) => {
      logger.info("Mongo Connection ERROR: " + error);
    });

    const run = async () => {
      await mongoose.connect(process.env.MONGODB_URI!, {
        keepAlive: true
      });
      // await boostrap();
      // console.log('success')
    };
    run().catch((error) => console.error(error));
  }

  public start(): void {
    this.app.listen(this.app.get("port"), () => {
      logger.info("API is running at http://localhost:" + this.app.get("port"));
    });
  }
}

async function startServer(): Promise<void> {
  const server = new Server();
  server.start();
  let cronJob = new CronJob('* * * * *', async () => {
    try {
      await updateStatusLcUpdate();
      await lcUpdate();
    } catch (e) {
      console.error(e);
    }
  });

  if (!cronJob.running) {
    cronJob.start();
  }
}

startServer();
