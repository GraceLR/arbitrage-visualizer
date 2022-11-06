import fs from 'fs';
import path from 'path';
import { toLower } from 'ramda';

export const ConfigKeys = {
    NETWORK_NAME: 'NETWORK_NAME',
    PASSWORD: 'PASSWORD',
    LOG_LEVEL: 'LOG_LEVEL',
    LOG_TO_FILE: 'LOG_TO_FILE',
    REGENERATE_GRAPHS: 'REGENERATE_GRAPHS',
    CHECK_ONLY_OWNED_CRYPOS: 'CHECK_ONLY_OWNED_CRYPOS',
};

const rawFile = fs.readFileSync(
    path.resolve(__dirname, '../config.json').toString(),
    {
        encoding: 'utf8',
    }
);
const config = JSON.parse(rawFile);

export const Config: { [name: string]: string } = Object.assign(
    {},
    ...Object.values(ConfigKeys).map((k) => ({
        [k]: config[toLower(k as string)],
    }))
);
