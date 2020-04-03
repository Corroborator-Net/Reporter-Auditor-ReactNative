import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {ImageRecord} from "../interfaces/Data";

// this is used by the logbook view in the auditor context - pass the auditor this dependency
export default class WebLogbookAndImageManager implements ImageDatabase {
    public static Instance:WebLogbookAndImageManager;

    private CachedRecords:{[imageHash:string]:ImageRecord[]} ={};


     addImageRecordAtHash(imageRecord:ImageRecord, hash:string){
         console.log("adding image record to hash:", hash);
         this.CachedRecords[hash] = [imageRecord];
         // if (!this.CachedRecords[hash]) {
         //     this.CachedRecords[hash] = [imageRecord];
         // }
         // else{
         //     this.CachedRecords[hash].push(imageRecord);
         // }
     }

     updateImageRecordAtHash(imageRecord:ImageRecord, hash:string){
         this.CachedRecords[hash] = [imageRecord];
         console.log("updating record at:", hash);

         // if (!this.CachedRecords[hash]) {
         //     this.CachedRecords[hash] = [imageRecord];
         // }
         // else{
         //     const foundIndex = this.CachedRecords[hash]
         //         .findIndex(record=>record.currentMultiHash == imageRecord.currentMultiHash);
         //     this.CachedRecords[hash][foundIndex] = imageRecord;
         //     console.log("replaced:",this.CachedRecords[hash][foundIndex].currentMultiHash)
         //
         // }
     }

    getImageRecordsWithMatchingRootHash(hash: string): Promise<import("../interfaces/Data").ImageRecord[]> {
        console.log("finding image record with hash:", hash);
        // console.log("got imagerecord:",this.CachedRecords[hash][0].rootMultiHash)
        return new Promise<ImageRecord[]> ((resolve, reject) =>  {resolve(this.CachedRecords[hash])});
    }

    add(data: ImageRecord): Promise<string> {
        throw new Error("Method not implemented.");
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
