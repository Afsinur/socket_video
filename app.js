const { createReadStream } = require("fs");
const http = require("http");
const server = http.createServer();
const port_ = process.env.port || "1000";
const static_ = `${__dirname}/public`;

const socket = require("socket.io");

//function

//server
server.on("request", (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-type": "text/html" });
    createReadStream(`${static_}/index.html`).pipe(res);
  } else if (req.url === "/css/style.css") {
    res.writeHead(200, { "Content-type": "text/css" });
    createReadStream(`${static_}/css/style.css`).pipe(res);
  } else if (req.url === "/js/app.js") {
    res.writeHead(200, { "Content-type": "text/javascript" });
    createReadStream(`${static_}/js/app.js`).pipe(res);
  } else if (req.url === "/js/socket.io.min.js") {
    res.writeHead(200, { "Content-type": "text/javascript" });
    createReadStream(`${static_}/js/socket.io.min.js`).pipe(res);
  } else if (req.url === "/streamvideo") {
    console.log(1);
    res.end();
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
  socket.on("blob", (data) => {
    io.sockets.emit("blob", data);
  });
});
