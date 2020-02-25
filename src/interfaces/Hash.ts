// take in data, output hash

export interface MultiHash{
    // @ts-ignore
    encode(buffer:Buffer, encoding:string):Buffer;
    // @ts-ignore
    decode(encoded:Buffer):string;

    // @ts-ignore
    toB58String(multiHash:Buffer):string;
    // @ts-ignore
    toHexString(multiHash:Buffer):string;
}