import { Client } from "ts-postgres";

const dbParams = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "800813",
  database: "arb",
};

const db = new Client(dbParams);

const db_connect = () => {
  db.connect();
  console.log(`Database connected at ${dbParams.port}`);
};

const db_export_arbs = async () => {
  const arb_data = await db.query(`SELECT * FROM graph_arbitrage;`);
  return arb_data;
};

const db_export_exchangepair = async (arbitrage_id: number) => {
  const cycle_data = await db.query(
    `SELECT id, arbitrage_id, crypto_id_0, crypto_id_1, exchange_name,
    to_char(price_tangent::numeric, '9.20EEEE') as price_tangent,
    inverse_price_tangent,
    is_dynamic,
    exchange_type,
    position FROM graph_exchangepair WHERE arbitrage_id = $1;`,
    [arbitrage_id]
  );
  return cycle_data;
};

const db_export_crypto = async (arbitrage_id: number) => {
  const crypto_data = await db.query(
    `SELECT * FROM graph_crypto WHERE arbitrage_id = $1;`,
    [arbitrage_id]
  );
  return crypto_data;
};

const db_import_arbs = async (
  chain: string,
  block_number: string,
  expected_profit: string
) => {
  await db.query(
    `INSERT INTO graph_arbitrage_2 (chain, block_number, expected_profit)
    VALUES ($1, $2, $3);`,
    [chain, block_number, expected_profit]
  );
  return;
};

const db_import_crypto = async (
  arbitrage_id: number,
  crypto: string,
  contract_address: string,
  precision: number,
  is_stable: boolean,
  usd_price: number
) => {
  await db.query(
    `INSERT INTO graph_crypto (arbitrage_id, crypto, contract_address, precision, is_stable, usd_price)
    VALUES ($1::integer, $2::varchar, $3::varchar, $4::integer, $5::boolean, $6::numeric);`,
    [arbitrage_id, crypto, contract_address, precision, is_stable, usd_price]
  );
  return;
};

export default {
  db_connect,
  db_export_arbs,
  db_export_exchangepair,
  db_export_crypto,
  db_import_arbs,
  db_import_crypto,
};
