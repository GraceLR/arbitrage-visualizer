import db_operations from "../db/db_operations";

const router = require("express").Router();

module.exports = () => {

  router.get("/", async (req: any, res: any) => {
    const data = await db_operations.db_export();
    res.send(data);
  });



  return router;
};
