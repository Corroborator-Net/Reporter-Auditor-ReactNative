const crypto = require('crypto');


export default class HashManager{

    // public static TestHash(){
    //     return crypto.createHash('sha256');
    // }

    // TODO  make this async if it's a costly op
    public static GetHashSync(base64Data:string):string{
        // @ts-ignore
        let buf = Buffer.from(base64Data, 'base64');
        let encoding = 'hex';
        return crypto.createHash('sha256').update(buf).digest(encoding);
    }

    // public async AssignHash(hashData:HashData, base64Data:string) : Promise<void> {
    //
    //     // console.log("setting hash");
    //     hashData.currentMultiHash = HashManager.GetHashSync(base64Data);
    //
    //     for (const hashReceiver of this.hashReceivers){
    //         hashReceiver.OnHashProduced(hashData)
    //     }
    // }


}