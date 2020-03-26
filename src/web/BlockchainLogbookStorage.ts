import {LogbookDatabase} from "../interfaces/Storage";
import {Log} from "../interfaces/Data";
//@ts-ignore
import { AtraApiKey } from 'react-native-dotenv'
import {LogMetadata} from "../shared/LogMetadata";

// this is used by the logbook view in the auditor context - pass the auditor this dependency
export default class BlockchainLogbookStorage implements LogbookDatabase {

    // REPORTER ONLY
    addNewRecord(newRecord: Log): Promise<string> {
        //@ts-ignore
        return null;
    }


    getRecordsFor(logBookAddress:string) : Promise<Log[]> {
        return this.GetAllData(logBookAddress);
    }


    async GetAtraRecords(tableID:string) {
        const resp = await fetch("https://api.atra.io/prod/v1/dtables/records?tableId="  + tableID + "&txinfo=true", {
            headers: {
                "x-api-key": AtraApiKey
            }
        });

        console.log(resp.statusText);
        const json = await resp.json();
        return json;
    }


    // gets the records in order of most recent to oldest
    async GetAllData(tableID:string):Promise<Log[]> {
        const json = await this.GetAtraRecords(tableID);
        const response = new Array<Log>();
        const liveRecords = json["live"];
        let i;
        // start at the end of the list
        for (i = liveRecords.length - 1; i >= 0; i--) {
            const record = liveRecords[i]["record"];
            console.log("atra record: " + record);
            const blockNumber = liveRecords[i]["event"]["blockNumber"];
            // get block time
            const resp = await fetch("https://api-rinkeby.etherscan.io/api?module=block&action=getblockreward&blockno=" + blockNumber);
            const blockJson = await resp.json();
            const blockTimeStamp = blockJson["result"]["timeStamp"];
            // make the date look like the one stored on chain
            let preDate = new Date(parseInt(blockTimeStamp) * 1000);

            let date="";
            if (BlockchainLogbookStorage.isValidDate(preDate)) {
                date = Log.getFormattedDateString(preDate);
            } else {
                date = "Pending..."
            }
            const hash = record[0];
            const storageLocation=record[1];
            const signedMetadata = record[2];

            // const newEntry = new Log(
            //     tableID,
            //     storageLocation,
            //     "TBD",
            //     hash,
            //     new LogMetadata(signedMetadata, null).JsonData()
            // );
            //
            // response.push(newEntry);
        }

        return response
    }

    static isValidDate(d:any) {
        //@ts-ignore
        return d instanceof Date && !isNaN(d);
    }


}
