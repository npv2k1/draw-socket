import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { messSocket } from "./mess.controller";

/**
 * It creates a new socket.io server, and when a client connects to it, it logs the connection, and
 * then calls the messSocket function
 * @param {HttpServer} httpServer - The HTTP server instance that the Socket.IO server will attach to.
 */
export default function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    allowEIO3: true,
    transports: ["websocket"],
  });
  // io.on("connection", (socket) => {
  //   console.log("Connecting to socket: " + socket.id);

  //   socket.on("disconnect", function () {
  //     console.log("disConnecting to socket: " + socket.id);
  //   });
  //   // ...
  //   messSocket(socket);
  //   socket.on("upload", (file, callback) => {
  //     console.log(file); // <Buffer 25 50 44 ...>

  //     // save the content to the disk, for example
  //     //  writeFile("/tmp/upload", file, (err) => {
  //     //    callback({ message: err ? "failure" : "success" });
  //     //  });
  //   });
  //   socket.eventNames().forEach((eventName) => {
  //     console.log(eventName);
  //   });

  //   console.log("a user connected");
  // });
  io.on("connection", (socket: Socket) => {
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      // socket.to(roomId).broadcast.emit("user-connected", userId);
      io.to(roomId).emit("user-connected", userId);
      // messages
      socket.on("message", (message) => {
        //send message to the same room
        io.to(roomId).emit("createMessage", message);
      });

      socket.on("disconnect", () => {
        // socket.to(roomId).broadcast.emit("user-disconnected", userId);
        io.to(roomId).emit("user-disconnected", userId);
      });
    });
  });

  io.on("connection", (socket: Socket) => {

    // Zoom
    socket.on("join-zoom", (roomId, userId) => {
      socket.join(roomId);
      console.log("join-zoom", roomId, userId);
      io.to(roomId).emit("user-connected", userId);
    })

    socket.on("draw", (data) => {
      console.log("data", data);
      socket.to(data.zoomId).emit("reciverDraw", data);

      // socket.join(roomId);
      // // socket.to(roomId).broadcast.emit("user-connected", userId);
      // io.to(roomId).emit("user-connected", userId);
      // // messages
      // socket.on("message", (message) => {
      //   //send message to the same room
      //   io.to(roomId).emit("createMessage", message);
      // });

      // socket.on("disconnect", () => {
      //   // socket.to(roomId).broadcast.emit("user-disconnected", userId);
      //   io.to(roomId).emit("user-disconnected", userId);
      // });
    });

    socket.on("clear",()=>{
      socket.broadcast.emit("clear");
    })
  });
}
