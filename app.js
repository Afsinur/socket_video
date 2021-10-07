const { createReadStream } = require("fs");
const http = require("http");
const server = http.createServer();
const port_ = process.env.PORT || "1000";
const static_ = `${__dirname}/public`;

const socket = require("socket.io");

//function

//server
server.on("request", (req, res) => {
  if (req.url === "/") {
    res.statusCode = 302;
    res.setHeader("Location", "/send/id");
    res.end();
  } else if (req.url === "/css/style.css") {
    res.writeHead(200, { "Content-type": "text/css" });
    createReadStream(`${static_}/css/style.css`).pipe(res);
  } else if (req.url === "/js/app.js") {
    res.writeHead(200, { "Content-type": "text/javascript" });
    createReadStream(`${static_}/js/app.js`).pipe(res);
  } else if (req.url === "/js/socket.io.min.js") {
    res.writeHead(200, { "Content-type": "text/javascript" });
    createReadStream(`${static_}/js/socket.io.min.js`).pipe(res);
  } else if (req.url === "/send/id") {
    res.writeHead(200, { "Content-type": "text/html" });
    createReadStream(`${static_}/index.html`).pipe(res);
  } else {
    res.writeHead(200, { "Content-type": "text/html" });
    createReadStream(`${static_}/404.html`).pipe(res);
  }
});

server.listen(port_, () => {
  console.log(`listening on port: ${port_} | ${Date()}`);
});

const io = socket(server);

io.on("connection", (socket) => {
  socket.on("join-room", ({ data }) => {
    let _RMid__ = data;
    socket.join(_RMid__);

    //send everyOne
    //io.to(roomId).emit("typing_name", data);
    //send others
    //socket.to(data).emit("joined", data);

    /*let room = io.sockets.adapter.rooms;
    let userID = socket.conn.id;*/

    socket.to(_RMid__).emit("joined", _RMid__);

    socket.on("blob", (data) => {
      //io.to(_RMid__).emit("blob", data);
      socket.to(_RMid__).emit("blob", data);
    });

    socket.on("fileRECV", (data) => {
      //io.to(_RMid__).emit("blob", data);
      socket.to(_RMid__).emit("fileRECV", data);
    });

    socket.on("blobStop", () => {
      socket.to(_RMid__).emit("blobStop");
    });
  });
});
