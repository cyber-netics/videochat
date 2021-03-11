import express from "express";
import { createServer } from "http";
import socket from "../socket";

type IPort = number;
type IHttp = IServerHttp;
type IIO = ISockerIo;

interface ISockerIo {
  sockets: any;
}

interface IServer {
  app: express.Application;
  start: () => void;
}

interface IServerHttp {
  listen: (port: IPort, cb: () => void) => void;
}

class Server implements IServer {
  public app = express.application;
  private port: IPort = 3001;
  private http: IHttp;
  private io: IIO;

  constructor() {
    this.app = express();
    this.middlewares();

    this.http = createServer(this.app);
    this.io = require("socket.io")(this.http);
  }

  private middlewares(): void {
    this.app.use(express.json());
    this.app.use(
      express.urlencoded({
        extended: false,
      })
    );
  }

  public start(): void {
    this.http.listen(this.port, () => {
      socket(this.io);
    });
  }
}

export default Server;
