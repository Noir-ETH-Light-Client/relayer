import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import logger from "./logger.js";
import mongoose from "mongoose";

dotenv.config();

class Server {
  public app: express.Application;
  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.mongo();
    // setupGlobalVariables();
  }

  public routes(): void {}

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
        keepAlive: true,
      });
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
}

startServer();
