import db_operations from "../db/db_operations";
const router = require("express").Router();

module.exports = () => {

  router.get("/arbs", async (req: any, res: any) => {
    const data = await db_operations.db_export_arbs();
    res.send(data.rows.map(arb => ({ id: arb[0], block: arb[1], created_on: arb[2], profit: arb[3] })));
  });

  router.get("/arbs/:id", async (req: any, res: any) => {
    const data = await db_operations.db_export_cycle(req.params.id);
    res.send(data.rows.map(node => ({ id: node[0], node_name: node[1], position: node[2], arb_id : node[3] })));
  });

  return router;
};
