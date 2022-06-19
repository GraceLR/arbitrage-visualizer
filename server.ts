import express, { Express } from 'express';
import morgan from 'morgan';
import { db_connect, db_insert, db_export } from './db/db_operations';

db_connect();

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

router.get("/", (req, res) => {
    console.log('router.get("/") successfull####');
    db_export();
});

router.post("/", (req, res) => {
    console.log('router.post("/") successfull')
    const { block, profit, nodesName } = req.body.params;
    db_insert(block, profit, nodesName).then(data => res.send(data));
});

router.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

