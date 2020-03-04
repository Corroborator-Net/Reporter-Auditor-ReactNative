import {BlockchainInterface} from "./interfaces/BlockchainInterface";
import {Log} from "./interfaces/Data";

//@ts-ignore
import { AtraApiKey } from 'react-native-dotenv'
export class NativeAtraManager implements BlockchainInterface {

    static firstTableId="93bc7f28-2a29-4489-9a0d-65cc7fee1b32";

    formTransaction(log: Log): string {
        const jsonTransaction = {
            "tableId":log.logBookAddress,
            "record":[
                log.dataMultiHash,
                log.storageLocation.slice(0,6),
                log.signedMetadataJson,
            ]
        };
        return JSON.stringify(jsonTransaction);
    }

    publishTransaction(txn: string): Promise<string> {
        return postData("https://api.atra.io/prod/v1/dtables/records",txn).then(
            (json)=>{
                return json.recordId;
            }).catch((err)=>{
                console.log("atra error to new transaction: ", err);
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

