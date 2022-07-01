import db_operations from "../db/db_operations";
import { Arb } from "../types/types";

const router = require("express").Router();

module.exports = () => {

  router.get("/", async (req: any, res: any) => {
    const data = await db_operations.db_export();
    res.send(data.rows.map(a => ({ id: a[0], block: a[1], created_on: a[2], profit: a[3]})) as Arb[]);
  });



  return router;
};
