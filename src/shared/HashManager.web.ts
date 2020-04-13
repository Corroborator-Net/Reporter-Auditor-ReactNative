// const crypto = require('crypto');
import { sha256 } from 'js-sha256';

export default class HashManager{

    public static GetHashSync(base64Data:string):string{
        // @ts-ignore
        // let buf = Buffer.from(base64Data, 'base64');
        // let encoding = 'hex';
        var hash = sha256.create();
        hash.update(base64Data);
        return hash.hex();
        // return crypto.createHash('sha256').update(buf).digest(encoding);
    }




}
