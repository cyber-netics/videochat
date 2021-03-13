class SocketController {
  public static joinCall = (socket: any, chache: any) => {
    chache.set(
      socket.id,
      JSON.stringify({
        id: socket.id,
        busy: false,
        caller: null,
      })
    );

    chache.findAll().then(async (users: any) => {
      for (let user in users) {
        if (users[user] !== socket.id) {
          let caller = await chache.get(users[user]);

          if (caller.busy === false) {
            chache.set(socket.id, {
              id: socket.id,
              busy: true,
              caller: caller.id,
            });

            chache.set(caller.id, {
              id: caller.id,
              busy: true,
              caller: socket.id,
            });

            socket.emit("all users", [caller]);
            console.log("tesitng......");
            break;
          }
        }
      }
    });
  };

  public static disconnect(socket: any, chache: any) {
    chache.get(socket.id).then((res: any) => {
      if (res.caller) {
        chache.set(res.caller, {
          id: res.id,
          busy: false,
          caller: null,
        });

        chache.set(socket.id, {
          id: socket.id,
          busy: false,
          caller: null,
        });
      }
    });
    chache.del(socket.id);
  }
}

export default SocketController;
