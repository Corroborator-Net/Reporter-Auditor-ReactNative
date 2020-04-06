import {HashData, ImageRecord, Log} from "./Data";

export interface UserPreferenceStorage {
    SetNewPersistentUserPreference(key:string, value:string[]):void;
    GetPersistentUserPreferenceOrDefault(key:string):Promise<string[]>;
    GetCachedUserPreference(key:string):string[];
}

export interface LogbookDatabase {
    getRecordsFor(logBookAddress:string) : Promise<Log[]>;
    addNewRecord(newRecord:Log) : Promise<string>;
    getUnsyncedRecords():Promise<Log[]>;

    updateLogWithTransactionHash(log:Log):void;
}


export interface ImageDatabase {
    add(data:HashData): Promise<string>;
    getImageRecordsWithMatchingRootHash(hash:string):Promise<ImageRecord[]>;
    removeImageRecord(imageRecord:ImageRecord):Promise<string>;
    addRecordToModifiedAlbumAndUpdateLocation(imageRecord:ImageRecord):Promise<string>;
}




