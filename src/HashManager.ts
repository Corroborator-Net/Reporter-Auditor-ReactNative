import {MultiHash} from "./interfaces/Hash";
import {HashData, HashReceiver} from "./interfaces/Data";


export default class HashManager{
    public hashReceivers:HashReceiver[];

    constructor(public hashModule:MultiHash,  ) {
        this.hashReceivers = new Array<HashReceiver>();
    }

    public OnDataProduced(dataToHash:HashData) : void {

        // @ts-ignore
        let buf = new Buffer('0beec7b5ea3f0fdbc95d0dd47f3c5asdasdasbc275da8a33', 'hex');
        let encoded = this.hashModule.encode(buf, 'sha2-256');
        let base58 = this.hashModule.toHexString(encoded);
        dataToHash.multiHash = base58;
        console.log("data produced!");
        console.log(base58);
        for (const hashReceiver of this.hashReceivers){
            hashReceiver.OnHashProduced(dataToHash)
        }
    }

    testHash(){
            // @ts-ignore
            let buf = new Buffer('0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', 'hex');
            let encoded = this.hashModule.encode(buf, 'sha2-256');
            console.log(encoded);
            let decoded = this.hashModule.decode(encoded);
            console.log(decoded);
        }

}