import express from "express";
import { createServer } from "http";
import socket from "../socket";
import Redis from "../chache";

interface IServer {
  start: () => void;
}

interface IHttp {
  listen: (port: IPort, cb: () => void) => void;
}

// interface IRedis {
//   connect: any;
// }

type IPort = number;
// type IRedisClient = IRedis | undefined;
type IApp = express.Application;

/**
 * @param{port} number
 * @param{redisport} number
 */

class Server implements IServer {
  private port: IPort = 3001;
  private redisPort: IPort = 6379;

  private chache: any;
  private http: IHttp;

  constructor() {
    const app = express();
    this.http = createServer(app);

    this.middlewares(app);
    this.connectCaching();
  }

  private connectCaching() {
    this.chache = new Redis({
      port: this.redisPort,
    });
  }

  private middlewares(app: IApp): void {
    app.use(express.json());
    app.use(
      express.urlencoded({
        extended: false,
      })
    );
  }

  public start(): void {
    this.http.listen(this.port, () => {
      const io = require("socket.io");
      socket(io(this.http), this.chache);
    });
  }
}

export default Server;
