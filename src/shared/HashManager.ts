import {HashData, HashReceiver} from "../interfaces/Data";
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

    public static GetHashSync(base64Data:string):string{
        // @ts-ignore
        let buf = Buffer.from(base64Data, 'base64');
        let encoding = 'hex';
        return crypto.createHash('sha256').update(buf).digest(encoding);
    }

    // TODO  make this async
    public async AssignHash(hashData:HashData, base64Data:string) : Promise<void> {

        // console.log("setting hash");
        hashData.currentMultiHash = HashManager.GetHashSync(base64Data);

        for (const hashReceiver of this.hashReceivers){
            hashReceiver.OnHashProduced(hashData)
        }
    }


}