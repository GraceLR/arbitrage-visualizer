// require('dotenv').config();
// import CryptoNode from '../bot/domain/crypto';
import fs from 'fs';
import chalk from 'chalk';
import { Client } from 'ts-postgres';

// const dbParamsFunc = () => {
//     let dbParams = {};
//     if (process.env.DATABASE_URL) {
//         // dbParams.connectionString = process.env.DATABASE_URL;
//     } else {
//         dbParams = {
//             host: process.env.DB_HOST,
//             port: process.env.DB_PORT,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASS,
//             database: process.env.DB_NAME,
//         };
//     }
//     return dbParams;
// };

// const dbParams = dbParamsFunc();

const dbParams = {
    host: 'localhost',
    port: 5432,
    user: 'gracelr',
    password: 'gracelr',
    database: 'arbitrage',
};

const db = new Client(dbParams);

const runSchemaFiles = async () => {
    console.log(chalk.cyan(`-> Loading Schema Files ...`));
    const schemaFilenames = fs.readdirSync('./schema');

    for (const fn of schemaFilenames) {
        const sql = fs.readFileSync(`./schema/${fn}`, 'utf8');
        console.log(`\t-> Running ${chalk.green(fn)}`);
        await db.query(sql);
    }
};

const runResetDB = async (dbParams: any) => {
    try {
        dbParams.host &&
            console.log(
                `-> Connecting to PG on ${dbParams.host} as ${dbParams.user}...`
            );
        dbParams.connectionString &&
            console.log(
                `-> Connecting to PG with ${dbParams.connectionString}...`
            );
        await db.connect();
        await runSchemaFiles();
        db.end();
    } catch (err) {
        console.error(chalk.red(`Failed due to error: ${err}`));
        db.end();
    }
};

const db_connect = () => {
    db.connect();
    console.log(`Database connected at ${dbParams.port}`);
};

const db_insert_arbs = (block: Number, profit: String) => {
    return `INSERT INTO arbs (block, profit) VALUES
('${block}', '${profit}') RETURNING *;`;
};

const db_insert_cycles = (node: String, position: Number, arb_id: Number) => {
    return `INSERT INTO cycles (node, position, arb_id) VALUES
('${node}', ${position}, ${arb_id}) RETURNING *;`;
};

const db_insert = async (
    block: Number,
    profit: String,
    nodesName: Array<string>// global should it be any? // have to parse it?
) => {
    // returning * ?
    const arb_data = await db.query(db_insert_arbs(block, profit));
    const arb_id = arb_data.rows[0][0] as Number;
    for (let i = 0; i < nodesName.length; i++) {
        const cycle = await db.query(
            db_insert_cycles(nodesName[i], i, arb_id)
        );
    }
};

const db_export_arbs_query = () => {
    return `SELECT *
    FROM arbs
    WHERE id < 11;`;
};

const db_export_arbs = async () => {
    const arb_data = await db.query(db_export_arbs_query());
    return arb_data;
};

const db_export_cycle = async (arb_id: number) => {
    const cycle_data = await db.query(`SELECT * FROM cycles WHERE arb_id = $1;`, [arb_id]);
    return cycle_data;
};

export default {
    db_connect,
    db_insert,
    db_export_arbs,
    db_export_cycle
};

