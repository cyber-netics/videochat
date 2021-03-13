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

    socket.on("endcall", (data: any) => {
      io.to(data).emit("listen caller", "testing...xxxx");
    });

    socket.on("disconnect", () => {
      controller.disconnect(socket, chache);
    });
  });
};

export default socket;
