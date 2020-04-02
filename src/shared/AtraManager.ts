import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import {Log} from "../interfaces/Data";
//@ts-ignore
import {AtraApiKey, EtherScanApiKey} from 'react-native-dotenv'
import {makeID} from "./Constants";

export class AtraManager implements BlockchainInterface {

    readonly emptyPlaceholder="null";




    // gets the records in order of most recent to oldest
    async getRecordsFor(logBookAddress:string):Promise<Log[]> {
        const logs = new Array<Log>();
        const resp = await fetch("https://api.atra.io/prod/v1/dtables/records?tableId="  + logBookAddress + "&txinfo=true", {
            headers: {
                "x-api-key": AtraApiKey
            }}).catch((error)=>{
            throw new Error("Getting logs: " + error)
        });
        const json = await resp.json();
        const liveRecords = json["live"];
        let i;
        // start at the end of the list
        for (i = liveRecords.length - 1; i >= 0; i--) {
            const atraResponse = (liveRecords[i]);
            const record = atraResponse["record"];
            const recordID = atraResponse["atraRecordId"];

            const blockNumber = liveRecords[i]["event"]["blockNumber"];
            const etherscanResponse = await
                fetch("https://api-rinkeby.etherscan.io/api?module=block&action=getblockreward&blockno=" + blockNumber
                + "&apikey=" + EtherScanApiKey);
            const blockJson = await etherscanResponse.json();
            const blockTimeStamp = blockJson["result"]["timeStamp"];
            // make the date look like the one stored on chain
            let preDate = new Date(parseInt(blockTimeStamp) * 1000);

            let date="";
            if (isValidDate(preDate)) {
                date = Log.getFormattedDateString(preDate);
            } else {
                date = "Pending..."
            }

            // const str = JSON.stringify(atraResponse, null, 2); // spacing level = 2
            // console.log("record from the chain:",str);
            // console.log("recordid from the chain:",recordID);


            const hash = record[0];
            const rootHash = record[1];
            const loggingKey = record[2];
            const storageLocation=record[3];
            const rootTransactionHash = record[4];

            // TODO: do we need to decrypt and mess with the metadata on chain? - perhaps to verify the embedded signature?
            const encryptedMetadata = record[5];


            const newEntry = new Log(
                logBookAddress,
                storageLocation,
                // if it has no root transaction has, it is the root so the current transaction hash is the root txn hash
                rootTransactionHash == this.emptyPlaceholder ? recordID: rootTransactionHash,
                recordID,
                rootHash,
                hash,
                encryptedMetadata,
                loggingKey,
                preDate,
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
                    "name":"RootHash",
                    "type":"text",
                },
                {
                    "name":"LoggingKey",
                    "type":"text",
                },
                {
                    "name":"StorageLocation",
                    "type":"text",
                },
                {
                    "name":"RootTransactionHash",
                    "type":"text",
                },
                {
                    "name":"EncryptedMetadata",
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
                log.currentDataMultiHash,
                log.rootDataMultiHash,
                log.loggingPublicKey,
                log.storageLocation.slice(0,4),
                log.rootTransactionHash==""? this.emptyPlaceholder :log.rootTransactionHash,
                log.encryptedMetadataJson,
            ]
        };
        return JSON.stringify(jsonTransaction);
    }

    publishTransaction(txn: string): Promise<string> {
        return postAtraData("https://api.atra.io/prod/v1/dtables/records",txn).then(
            (json)=>{
                // console.log("atra resp to new transaction: ", json);

                if (json["error"]){
                    console.log("atra error to new transaction: ", json);
                }
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

