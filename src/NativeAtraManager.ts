import {BlockchainInterface} from "./interfaces/BlockchainInterface";
import {Log} from "./interfaces/Data";

//@ts-ignore
import { AtraApiKey } from 'react-native-dotenv'
export class NativeAtraManager implements BlockchainInterface {

    static firstTableId="ae639419-4cd8-490f-8645-fb6324b024d8";

    formTransaction(log: Log): string {
        const jsonTransaction = {
            "tableId":log.logBookAddress,
            "record":[
                log.dataMultiHash,
                log.signedHashes,
                log.signedMetadata,
                log.signedMetadata,
                log.storageLocation.slice(0,6),
            ]
        };
        return JSON.stringify(jsonTransaction);
    }

    publishTransaction(txn: string): Promise<string> {
        return postData("https://api.atra.io/prod/v1/dtables/records",txn).then(
            (json)=>{
                console.log("atra response to new transaction follows: ", json);
                return json.recordId;
            }).catch((err)=>{
                console.log(err);
                return err;
        })
    }

}

// Example POST method implementation:
async function postData(url = '', data = {}) {
    // Default options are marked with *
    // console.log(AtraApiKey);
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'x-api-key':AtraApiKey,
        },
        body: data // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}

