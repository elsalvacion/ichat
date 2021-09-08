const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const { Server } = require("socket.io");

// config
const connectDB = require("./config/db");

// require and use config files
require("dotenv").config({ path: "./config/.env" });
// connectDB();

// require other files
const namespaces = require("./dataStructure/ds");

const app = express();

// external middlewares
app.use(mongoSanitize());
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(hpp());

// express body parser

app.use(express.json());

// static
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 5000;

// listen to a port
const server = app.listen(PORT, () =>
  console.log(
    `server up and running on ${process.env.NODE_ENV} MODE at ${PORT}`
  )
);

// socket io stuff
const io = new Server(server);

io.on("connection", (socket) => {
  socket.emit("allNamespaces", namespaces);
  // connect to every namespace
});

namespaces.forEach((ns) => {
  io.of(ns.endpoint).on("connection", (nsSocket) => {
    console.log(`connected to ${ns.title}`);

    nsSocket.emit("rooms", ns.rooms);

    nsSocket.on("joinRoom", (room) => {
      const nsRoom = Array.from(nsSocket.rooms)[1];
      if (typeof nsRoom !== "undefined") nsSocket.leave(nsRoom);

      nsSocket.join(room);

      console.log("joined room " + room);

      // send room chat history back
      let history = null;
      ns.rooms.forEach((nsRoom) => {
        if (nsRoom.title === room) return (history = nsRoom.history);
      });

      // console.log(history);

      // // emit history to client
      nsSocket.emit("history", history);
    });

    nsSocket.on("messageFromClient", (text) => {
      const nsRoom = Array.from(nsSocket.rooms)[1];

      const date = new Date();
      const time = date.toDateString() + " " + date.toLocaleTimeString();

      const msg = {
        text,
        time,
        sender: "STEPS",
      };
      io.of(ns.endpoint).to(nsRoom).emit("messageFromServer", msg);

      // add to history
      ns.rooms.forEach((room) => {
        if (room.title === nsRoom) room.history.push(msg);
      });
    });
  });
});
