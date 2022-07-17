import "dotenv/config";
import express, { Request, Response } from "express";
import { createServer } from "http";
import path from "path";
import indexController from "./controllers/index.controller";
import initSocket from "./modules/socket/socket";
import initTodo from "./modules/todo/todo";
import initUpload from "./modules/upload/upload";
import "./services/db";

// import { ExpressPeerServer } from "peer";
import { v4 as uuidV4 } from "uuid";


var cors = require("cors");
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
console.log(path.join(__dirname, "public"));
app.use(express.static(path.join(__dirname, "public")));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.use("/api", indexController);
initUpload(app);
initTodo(app);
const httpServer = createServer(app);
initSocket(httpServer);
var ExpressPeerServer = require('peer').ExpressPeerServer;
var peerExpress = require('express');
var peerApp = peerExpress();
var peerServer = require('http').createServer(peerApp);
var options = { debug: true }
var peerPort = 9000;

peerApp.use("/peerjs", ExpressPeerServer(peerServer, options));
peerServer.listen(peerPort);
/* Listening to the port 5000. */
httpServer.listen(5000, () => {
  console.log("server is running on port 5000");
});
