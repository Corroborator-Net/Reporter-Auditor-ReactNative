import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import {Log} from "../interfaces/Data";

//@ts-ignore
import { AtraApiKey, EtherScanApiKey } from 'react-native-dotenv'
export class AtraManager implements BlockchainInterface {


    async GetAtraRecords(tableID:string) {
        const resp = await fetch("https://api.atra.io/prod/v1/dtables/records?tableId="  + tableID + "&txinfo=true", {
            headers: {
                "x-api-key": AtraApiKey
            }
        });

        // console.log(resp.statusText);
        return await resp.json();
    }


    // gets the records in order of most recent to oldest
    async getRecordsFor(logBookAddress:string):Promise<Log[]> {
        const json = await this.GetAtraRecords(logBookAddress);
        const logs = new Array<Log>();
        const liveRecords = json["live"];
        let i;
        // start at the end of the list
        for (i = liveRecords.length - 1; i >= 0; i--) {
            const record = (liveRecords[i]["record"]);
            // console.log("atra record: ", record);
            const blockNumber = liveRecords[i]["event"]["blockNumber"];
            // get block time
            const resp = await
                fetch("https://api-rinkeby.etherscan.io/api?module=block&action=getblockreward&blockno=" + blockNumber
                + "&apikey=" + EtherScanApiKey);
            const blockJson = await resp.json();
            const blockTimeStamp = blockJson["result"]["timeStamp"];
            // make the date look like the one stored on chain
            let preDate = new Date(parseInt(blockTimeStamp) * 1000);

            let date="";
            if (isValidDate(preDate)) {
                date = Log.getFormattedDateString(preDate);
            } else {
                date = "Pending..."
            }
            const hash = record[0];
            const storageLocation=record[1];
            const rootTransactionHash = record[2];

            // TODO: do we need to decrypt and mess with it?
            const encryptedMetadata = record[3];


            const newEntry = new Log(
                logBookAddress,
                storageLocation,
                rootTransactionHash,
                "TBD",
                hash,
                    "TBD"
            );

            logs.push(newEntry);
        }

        return logs
    }


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
                    "name":"OriginalTransactionHash",
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
                log.rootTransactionHash==""?"null":log.rootTransactionHash,
                log.encryptedMetadataJson,
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

function isValidDate(d:any) {
    //@ts-ignore
    return d instanceof Date && !isNaN(d);
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

