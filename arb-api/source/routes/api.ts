import db_operations from "../db/db_operations";
const router = require("express").Router();

module.exports = () => {
  router.get("/arbs", async (req: any, res: any) => {
    const data = await db_operations.db_export_arbs();
    res.send(
      data.rows.map((arb) => ({
        id: arb[0],
        chain: arb[1],
        block_number: arb[2],
        created_on: arb[3],
        expected_profit: arb[4],
      }))
    );
  });

  router.get("/arbs/:id", async (req: any, res: any) => {
    const exchangepair = await db_operations.db_export_exchangepair(
      req.params.id
    );
    const crypto = await db_operations.db_export_crypto(req.params.id);
    res.send({
      exchangepair: exchangepair.rows.map((pair) => ({
        id: pair[0],
        arbitrage_id: pair[1],
        crypto_id_0: pair[2],
        crypto_id_1: pair[3],
        exchange_name: pair[4],
        price_tangent: pair[5],
        inverse_price_tangent: pair[6],
        is_dynamic: pair[7],
        exchange_type: pair[8],
        position: pair[9],
      })),
      crypto: crypto.rows.map((node) => ({
        id: node[0],
        arbitrage_id: node[1],
        crypto: node[2],
        contract_address: node[3],
        precision: node[4],
        is_stable: node[5],
        usd_price: node[6],
        wallet_amount: node[7],
      })),
    });
  });
  return router;
};
