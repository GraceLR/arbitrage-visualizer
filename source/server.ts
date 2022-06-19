import express, { Express } from 'express';
import morgan from 'morgan';
import db_operations from './db/db_operations';

db_operations.db_connect();

// Web server config
const PORT = process.env.PORT || 8080;
/** Port */
const router: Express = express();
/** Logging */
router.use(morgan('dev'));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

const api = require("./routes/api");

router.use("/api", api());

router.get("/", (req, res) => {
    console.log('router.get("/") successfull####');
});

router.post("/", (req, res) => {
    console.log('router.post("/") successfull')
    const { block, profit, nodesName } = req.body.params;
    db_operations.db_insert(block, profit, nodesName).then(data => res.send(data));
});

router.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

