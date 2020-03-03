import {HashData, ImageRecord, Log} from "./Data";

export interface LogbookDatabase {
    getRecordsFor(logBookAddress:string) : Promise<Log[]>;
    getAllRecords(reporterAddress:string): Promise<Log[]>;
    // TODO what should the returned promise contain?
    addNewRecord(newRecord:Log) : Promise<string>;
}

// REPORTER ONLY, essentially an extension of the above
export interface LocalLogbookDatabase extends LogbookDatabase{
    type:string;
    getUnsyncedRecords():Promise<Log[]>;
    updateRecord(log:Log):void;
}

export interface ImageDatabase {
    add(data:HashData): Promise<string>;
    getImages(logs:Log[]):Promise<ImageRecord[]>;
}




