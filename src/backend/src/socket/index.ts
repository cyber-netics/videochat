import controller from "../controller/sockets";

const socket = (io: any, chache: any) => {
  // let users: any = {};

  io.on("connection", (socket: any) => {
    socket.on("join room", () => {
      controller.joinCall(socket, chache);
    });

    socket.on("sending signal", (payload: any) => {
      io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
      });
    });

    socket.on("returning signal", (payload: any) => {
      io.to(payload.callerID).emit("receiving returned signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    socket.on("endcall", async (callerId: any) => {
      let data = await chache.get(callerId);
      if (data.caller) {
        chache.set(
          data.caller,
          JSON.stringify({
            id: data.caller,
            busy: false,
            caller: null,
          })
        );
      }

      chache.findAll().then(async (users: any) => {
        for (let user in users) {
          if (users[user] !== socket.id) {
            let caller = await chache.get(users[user]);
            io.to(callerId).emit("callerends", [caller]);
            console.log("matchuser", caller);
            break;
          }
        }
      });
    });

    socket.on("disconnect", () => {
      controller.disconnect(socket, chache);
    });
  });
};

export default socket;
