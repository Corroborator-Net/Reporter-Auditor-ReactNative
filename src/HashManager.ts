import {MultiHash} from "./interfaces/Hash";
import {HashData, HashReceiver} from "./interfaces/Data";
const crypto = require('crypto');




export default class HashManager{
    public hashReceivers:HashReceiver[];
    hash = crypto.createHash('sha256');
    //constructor( public hashModule:MultiHash, ) {
    constructor(  ) {
        this.hashReceivers = new Array<HashReceiver>();
    }

    public async OnDataProduced(dataToHash:HashData, base64Data:string) : Promise<void> {
        // TODO lets save file, load it, and hash it to see if we get the same hash
        const data = base64Data.slice(0,300);
        console.log( "base64 image slice:" + data);

        // @ts-ignore
        let buf = Buffer.from(data, 'base64');

        const hash = crypto.createHash('sha256').update(buf).digest('base64');
        console.log(hash);
        dataToHash.multiHash = hash;
        // console.log("data produced!");
        // console.log(encoded);
        // for (const hashReceiver of this.hashReceivers){
        //     hashReceiver.OnHashProduced(dataToHash)
        // }
    }

    // testHash(){
    //         // @ts-ignore
    //         let buf = new Buffer('0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', 'hex');
    //         let encoded = this.hashModule.encode(buf, 'sha2-256');
    //         console.log(encoded);
    //         let decoded = this.hashModule.decode(encoded);
    //         console.log(decoded);
    //     }

}