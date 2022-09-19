import express, { Express } from "express";
import morgan from "morgan";
import db_operations from "./db/db_operations";
import { runBot } from "./graph_generator/bot";

// db_operations.db_connect();

// Web server config
var HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const CORS_PORT = process.env.CORS_PORT || 8081;
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

runBot()

// router.get("/", (req, res) => {
//   console.log('router.get("/") successfull####');
// });

var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(CORS_PORT, HOST, function() {
    console.log('Running CORS Anywhere on ' + HOST + ':' + CORS_PORT);
});

router.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
