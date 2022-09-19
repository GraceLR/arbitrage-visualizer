import * as build from '../contracts/built';
import * as interfaces from '../contracts/interfaces';

export const get_abi = (file_name: string): string[] => {
    const file = (interfaces as any)[file_name];
    return file as string[];
};

export const get_built_abi = (file_name: string): string[] => {
    const file = (build as any)[file_name];
    return file.abi as string[];
};
