import express from "express";

export interface IServer {
  app: express.Application;
  start: () => void;
}

export interface IHttp {
  listen: (port: IPort, cb: () => void) => void;
}

export type IPort = number;
