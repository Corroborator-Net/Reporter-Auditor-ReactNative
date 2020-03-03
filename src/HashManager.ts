import {MultiHash} from "./interfaces/Hash";
import {HashData, HashReceiver} from "./interfaces/Data";
const crypto = require('crypto');


export default class HashManager{
    public hashReceivers:HashReceiver[];
    //constructor( public hashModule:MultiHash, ) {
    constructor(  ) {
        this.hashReceivers = new Array<HashReceiver>();
    }

    public static TestHash(){
        return crypto.createHash('sha256');
    }

    // TODO let's make this async
    public async GetHash(hashData:HashData, base64Data:string) : Promise<void> {

        // @ts-ignore
        let buf = Buffer.from(base64Data, 'base64');
        let encoding = 'hex';
        const hash = crypto.createHash('sha256').update(buf).digest(encoding);
        // console.log("setting hash");
        hashData.multiHash = hash;

        for (const hashReceiver of this.hashReceivers){
            hashReceiver.OnHashProduced(hashData)
        }
    }


}