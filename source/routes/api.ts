import db_operations from "../db/db_operations";
const router = require("express").Router();

module.exports = () => {

  router.get("/arbs", async (req: any, res: any) => {
    const data = await db_operations.db_export_arbs();
    res.send(data.rows.map(a => ({ id: a[0], block: a[1], created_on: a[2], profit: a[3]})));
  });

  router.get("/arbs/:id", async (req: any, res: any) => {
    const data = await db_operations.db_export_cycle(req.params.id);
    res.send(data);
  });

  return router;
};
