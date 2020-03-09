import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import {Log} from "../interfaces/Data";

//@ts-ignore
import { AtraApiKey } from 'react-native-dotenv'
export class NativeAtraManager implements BlockchainInterface {

    getNewLogbook():Promise<string>{

        const newTable={
            "name":"ReactNativeCorro" + makeID(5),
            "columns":[
                {
                    "name":"Hash",
                    "type":"text",
                },
                {
                    "name":"StorageLocation",
                    "type":"text",
                },
                {
                    "name":"SignedMetadata",
                    "type":"text",
                }

            ]
        };
        const jsonBody = JSON.stringify(newTable);
        console.log("new table json: ", jsonBody);
        return postAtraData("https://api.atra.io/prod/v1/dtables",jsonBody).then(
            (json)=>{
                console.log("new table json:", json);
                return json.id;
            }).catch((err)=>{
            console.log("atra error to new table post: ", err);
            return err;
        })
    }

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
        return postAtraData("https://api.atra.io/prod/v1/dtables/records",txn).then(
            (json)=>{
                return json.recordId;
            }).catch((err)=>{
                console.log("atra error to new transaction: ", err);
                return err;
        })
    }

}

function makeID(length:number):string {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Example POST method implementation:
async function postAtraData(url = '', data = {}) {
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

