import redis from "redis";

interface IProps {
  port: number;
}

class Helpers {
  protected compress(content: any) {
    if (typeof content === "string") {
      return content;
    }
    return JSON.stringify(content);
  }

  protected parse(data: any) {
    try {
      return JSON.parse(data);
    } catch (_) {
      return data;
    }
  }
}

class Actions extends Helpers {
  public client: any;

  public set(key: string, content: string | object) {
    if (!content || !key) {
      throw new Error("No Key or Content");
    }

    this.client.set(key, this.compress(content));
  }

  public get(key: string) {
    if (!key) throw new Error("Key is missing");

    return new Promise((resolve, reject) => {
      this.client.get(key, (err: any, data: any) => {
        if (err) reject(err);
        resolve(this.parse(data));
      });
    });
  }

  public findAll() {
    return new Promise((resolve, reject) => {
      this.client.keys("*", function (err: any, keys: any) {
        if (err) reject(err);
        resolve(keys);
      });
    });
  }

  public del(key: string) {
    this.client.del(key);
  }
}

class RedisCache extends Actions {
  private port: number;
  public client: any;

  constructor({ port }: IProps) {
    super();

    this.port = port;

    this.createClient();
    this.connectClient();
  }

  private createClient() {
    const client = redis.createClient;
    this.client = client(this.port);
  }

  private connectClient() {
    this.client.on("connect", () => {
      console.log("redis connected");
    });
  }
}

export default RedisCache;
