import {HashData, Log} from "./Data";

export interface UserPreferenceStorage {
    SetNewPersistentUserPreference(key:string, value:string[]):void;
    GetPersistentUserPreferenceOrDefault(key:string):Promise<string[]>;
}

export interface LogbookDatabase {
    // BOTH
    getRecordsFor(logBookAddress:string) : Promise<Log[]>;

    // Reporter only
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
    getImages(logs:Log[]):Promise<string[]>;
}




