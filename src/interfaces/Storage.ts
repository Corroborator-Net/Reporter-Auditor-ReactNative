import {HashData, Log} from "./Data";

export interface LogbookDatabase {
    getRecordsFor(logBookAddress:string) : Promise<Log[]>;
    // TODO what should the returned promise contain?
    addNewRecord(newRecord:Log) : Promise<string>;
}

export interface ImageDatabase {
    add(data:HashData): Promise<string>;
}
