import R from 'ramda';
import { Config, ConfigKeys } from '../config/config';
import fs from 'fs';
import path from 'path';

export const LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARNING: 2,
    ERROR: 3,
    CRITICAL: 4,
} as { [name: string]: number };

const ignoreLevel = Config[R.toUpper(ConfigKeys.LOG_LEVEL)];

if (R.isNil(ignoreLevel)) {
    throw new Error('LOG_LEVEL not defined or invalid');
}

export function log_message(message: string, level = LEVELS.INFO) {
    if (level < LEVELS[ignoreLevel]) {
        return;
    }

    if (R.toLower(Config[ConfigKeys.LOG_TO_FILE]) === 'true') {
        fs.appendFile(
            path.resolve(
                __dirname,
                '../../',
                `${Config[ConfigKeys.NETWORK_NAME]}.log`
            ),
            message + '\n',
            () => {}
        );
    }

    if (level === LEVELS.DEBUG) {
        console.debug(message);
    } else if (level === LEVELS.INFO) {
        console.info(message);
    } else if (level === LEVELS.WARNING) {
        console.warn(message);
    } else if (level === LEVELS.ERROR) {
        console.error(message);
    } else if (level === LEVELS.CRITICAL) {
        console.error(message);
    }
}
