import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {ImageRecord} from "../interfaces/Data";

// this is used by the logbook view in the auditor context - pass the auditor this dependency
export default class WebLogbookAndImageManager implements ImageDatabase {
    public static Instance:WebLogbookAndImageManager;

    private CachedRecords:{[logbookAddress:string]:ImageRecord[]} ={};


     addImageRecordToLogbook(data:ImageRecord, hash:string){
         console.log("adding image record to hash:", hash)
         if (!this.CachedRecords[hash]) {
             this.CachedRecords[hash] = [data];
         }
     else{
             this.CachedRecords[hash].push(data);
         }
     }

    add(data: ImageRecord): Promise<string> {
    }

    getImageRecordsWithMatchingRootHash(hash: string): Promise<import("../interfaces/Data").ImageRecord[]> {
        console.log("finding image record with hash:", hash)
        return new Promise<ImageRecord[]> ((resolve, reject) =>  {resolve(this.CachedRecords[hash])});
    }
    removeImageRecord(imageRecord: import("../interfaces/Data").ImageRecord): Promise<string> {
        throw new Error("Method not implemented.");
    }
    updateImageRecordToHead(imageRecord: import("../interfaces/Data").ImageRecord): Promise<string> {
        throw new Error("Method not implemented.");
    }

    constructor() {
        if (WebLogbookAndImageManager.Instance){
            return WebLogbookAndImageManager.Instance;
        }
        WebLogbookAndImageManager.Instance= this;
    }







}
