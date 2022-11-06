import fs from 'fs';
import path from 'path';

function getFile(file_name: string, folder: string) {
    const rawFile = fs.readFileSync(
        path
            .resolve(
                __dirname,
                '../',
                `contracts/${folder}/${file_name}.json`
            )
            .toString(),
        { encoding: 'utf8' }
    );
    const abi = JSON.parse(rawFile);
    return abi;
}

export function get_abi(file_name: string): string[] {
    return getFile(file_name, 'interfaces');
}

export function get_built_abi(file_name: string): string[] {
    return getFile(file_name, 'build').abi;
}
