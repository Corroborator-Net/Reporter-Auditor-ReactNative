import {HashData, Log} from "./Data";

export interface UserPreferenceStorage {
    SetNewPersistentUserPreference(key:string, value:string[]):void;
    GetPersistentUserPreferenceOrDefault(key:string):Promise<string[]>;
}

export interface LogbookDatabase {
    getRecordsFor(logBookAddress:string) : Promise<Log[]>;
    addNewRecord(newRecord:Log) : Promise<string>;
}

// REPORTER ONLY for now.... but it seems like anyone should be able to update records as long as they have keys
export interface LocalLogbookDatabase extends LogbookDatabase{
    type:string;
    getUnsyncedRecords():Promise<Log[]>;
    updateRecord(log:Log):void;
}

export interface ImageDatabase {
    add(data:HashData): Promise<string>;
    getImages(logs:Log[]):Promise<string[]>;
}




