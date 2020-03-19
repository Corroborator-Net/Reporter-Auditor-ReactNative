import {HashData, ImageRecord, Log} from "./Data";

export interface UserPreferenceStorage {
    SetNewPersistentUserPreference(key:string, value:string[]):void;
    GetPersistentUserPreferenceOrDefault(key:string):Promise<string[]>;
}

export interface LogbookDatabase {
    getRecordsFor(logBookAddress:string) : Promise<Log[]>;
    addNewRecord(newRecord:Log) : Promise<string>;
    getUnsyncedRecords():Promise<Log[]>;

    updateLogWithTransactionHash(log:Log):void;
}


export interface ImageDatabase {
    add(data:HashData): Promise<string>;
    getImages(logs:Log[]):Promise<string[]>;
    getImageRecordsWithMatchingRootHash(hash:string):Promise<ImageRecord[]>;
    removeImageRecord(imageRecord:ImageRecord):Promise<string>;
    getUnLoggedEditedImages():Promise<ImageRecord[]>;

}




