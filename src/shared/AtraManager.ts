import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import {Log} from "../interfaces/Data";

import fetchWithTimeout, {makeID, prettyPrint} from "./Constants";
import {LogbookDatabase} from "../interfaces/Storage";

export class AtraManager implements BlockchainInterface, LogbookDatabase {

    readonly emptyPlaceholder="null";
    HashMapToTimestamp:{[blockHash:string]:number} = {}


    //TODO: etherscan won't let us get blocktimes for every single log so quickly, we need to space it out or filter
    // what we need somehow
    async getRecordsFor(logBookAddress:string, ignoringLogs:Log[]|null):Promise<Log[]> {
        const logs = new Array<Log>();
        const resp = await fetchWithTimeout("https://api.atra.io/prod/v1/dtables/records?tableId="  + logBookAddress + "&txinfo=true", {
            headers: {
                "x-api-key": "vdssu05AWO6yAG4ojL4Sv6I9RkAGCak19hBhTVpm"
            }},30000).catch((error)=>{
            console.log("atra fetch ERROR:", error);
            throw new Error(error)
        });
        const json = await resp.json();
        if (json["error"]){
            console.log("atra json ERROR:", json);
            throw new Error(json["error"])
        }

        const liveRecords = json["live"];
        if (!liveRecords){
            return logs;
        }
        let i;
        // start at the end of the list
        for (i = liveRecords.length - 1; i >= 0; i--) {
            const atraResponse = liveRecords[i];
            // prettyPrint("resp:", atraResponse);
            const record = atraResponse["record"];
            const recordIDAndTransactionHash = atraResponse["atraRecordId"];
            const hash = record[0];
            const rootHash = record[1];
            const loggingKey = record[2];
            const storageLocation=record[3];
            const rootTransactionHash = record[4];

            // TODO: do we need to decrypt and mess with the metadata on chain? - perhaps to verify the embedded signature?
            const encryptedMetadata = record[5];

            // ignore logs with the same transaction hash - we have a local timestamp for them already
            if (ignoringLogs && ignoringLogs.findIndex((ignoreLog)=>{
                return ignoreLog.currentTransactionHash == recordIDAndTransactionHash
            })>=0){
                continue
            }

            let blockHash = liveRecords[i]["event"]["blockHash"];
            let blockTimeStamp;
            if (this.HashMapToTimestamp[blockHash]){
                blockTimeStamp = this.HashMapToTimestamp[blockHash];
            }
            else{
                const infuraResponse = await fetch("https://rinkeby.infura.io/v3/cf6eff6e2b554d80826e056d5c040587", {
                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "jsonrpc":"2.0",
                        "method":"eth_getBlockByHash",
                        "id":1,
                        "params": [blockHash, true]})
                }).catch((error) => {
                    console.log("timestamp ERROR:", infuraResponse);
                    throw new Error(error)
                });

                const blockJson = await infuraResponse.json();
                blockTimeStamp = parseInt(blockJson["result"]["timestamp"],16)*1000;
                this.HashMapToTimestamp[blockHash] = blockTimeStamp;

            }

            // make the date look like the one stored on chain
            // let preDate = new Date(parseInt(blockTimeStamp) * 1000);

            //
            // let date="";
            // if (isValidDate(preDate)) {
            //     date = Log.getFormattedDateString(preDate);
            // } else {
            //     date = "Pending..."
            // }

            // const str = JSON.stringify(atraResponse, null, 2); // spacing level = 2
            // console.log("record from the chain:",str);
            // console.log("recordid from the chain:",recordID);




            const newEntry = new Log(
                logBookAddress,
                storageLocation,
                // if it has no root transaction has, it is the root so the current transaction hash is the root txn hash
                rootTransactionHash == this.emptyPlaceholder ? recordIDAndTransactionHash: rootTransactionHash,
                recordIDAndTransactionHash,
                rootHash,
                hash,
                encryptedMetadata,
                loggingKey,
                blockTimeStamp
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

    addNewRecord(newRecord: Log): Promise<string> {
        //@ts-ignore
        return undefined;
    }

    getUnsyncedRecords(): Promise<Log[]> {
        //@ts-ignore
        return undefined;
    }

    updateLogWithTransactionHash(log: Log): void {
    }
}

function isValidDate(d:any) {
    //@ts-ignore
    return d instanceof Date && !isNaN(d);
}

// Example POST method implementation:

async function postAtraData(url = '', data:string) {
    // Default options are marked with *
    // console.log(AtraApiKey);
    //@ts-ignore
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'x-api-key':"vdssu05AWO6yAG4ojL4Sv6I9RkAGCak19hBhTVpm",
        },
        body: data // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}

