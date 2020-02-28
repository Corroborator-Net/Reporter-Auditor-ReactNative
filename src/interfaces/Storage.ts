import {HashData, Log} from "./Data";

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
    getImages(first:number):Promise<Array<PhotoIdentifier>>;
}


// TODO: we don't need all this, but this is what the camera roll library returns. Let's simplify it
interface PhotoIdentifier {
    node: {
        type: string,
        group_name: string,
        image: {
            filename: string,
            uri: string,
            height: number,
            width: number,
            isStored?: boolean,
            playableDuration: number,
        },
        timestamp: number,
        location?: {
            latitude?: number,
            longitude?: number,
            altitude?: number,
            heading?: number,
            speed?: number,
        },
    }
};


