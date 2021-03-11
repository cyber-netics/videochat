const socket = (io: any) => {
  const users: any = {};

  io.on("connection", (socket: any) => {
    console.log("connecting .....");

    socket.on("join room", () => {
      users[socket.id] = {
        id: socket.id,
        busy: false,
        caller: null,
      };

      Object.keys(users).map(user => {
        if (users[user].id !== socket.id && !users[user].busy) {
          socket.emit("all users", [users[user]]);
          users[socket.id].caller = users[user].id;
          users[users[user].id].caller = socket.id;
        }
      });
    });

    socket.on("sending signal", (payload: any) => {
      io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
      });
      users[socket.id].busy = true;
    });

    socket.on("returning signal", (payload: any) => {
      io.to(payload.callerID).emit("receiving returned signal", {
        signal: payload.signal,
        id: socket.id,
      });
      users[socket.id].busy = true;
    });

    socket.on("disconnect", () => {
      // current user
      const user = socket.id;
      delete users[user];

      // caller
      if (users[socket.id] && users[socket.id].caller) {
        const caller = users[socket.id].caller;
        users[caller].busy = false;
        users[caller].caller = null;
      }
    });
  });
};

export default socket;
