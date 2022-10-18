import express, { Express } from "express";
import ws from "ws";
import morgan from "morgan";
import db_operations from "./db/db_operations";
import { runBot } from "./graph/bot";

db_operations.db_connect();

// Web server config
const PORT = process.env.PORT || 8080;
/** Port */
const router: Express = express();
/** Logging */
router.use(morgan("dev"));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

const api = require("./routes/api");

router.use("/api", api());

const wsServer = new ws.Server({ noServer: true });

const clients = {};
let id = 0;

wsServer.on("connection", (socket) => {
  //socket.on('message', message => console.log(message))
  clients[id++] = socket;
});

runBot(clients);

// router.get("/", (req, res) => {
//   console.log('router.get("/") successfull####');
// });

const server = router.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});
