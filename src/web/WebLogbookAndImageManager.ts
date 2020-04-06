import {ImageDatabase} from "../interfaces/Storage";
import {ImageRecord} from "../interfaces/Data";

// this is used by the logbook view in the auditor context - pass the auditor this dependency
export default class WebLogbookAndImageManager implements ImageDatabase {
    public static Instance:WebLogbookAndImageManager;

    private CachedRecords:{[imageHash:string]:ImageRecord[]} ={};


     addImageRecordAtRootHash(imageRecord:ImageRecord){
         // console.log("adding image record to hash:", imageRecord.rootMultiHash);
         // this.CachedRecords[hash] = [imageRecord];
         if (!this.CachedRecords[imageRecord.rootMultiHash]) {
             this.CachedRecords[imageRecord.rootMultiHash] = [imageRecord];
         }
         else{
             this.CachedRecords[imageRecord.rootMultiHash].push(imageRecord);
         }
     }

     updateImageRecordAtRootHash(imageRecord:ImageRecord){
         // this.CachedRecords[hash] = [imageRecord];
         // console.log("updating record at:", imageRecord.rootMultiHash);

         if (!this.CachedRecords[imageRecord.rootMultiHash]) {
             this.CachedRecords[imageRecord.rootMultiHash] = [imageRecord];
         }
         else{
             const foundIndex = this.CachedRecords[imageRecord.rootMultiHash]
                 .findIndex(record=>record.currentMultiHash == imageRecord.currentMultiHash);
             this.CachedRecords[imageRecord.rootMultiHash][foundIndex] = imageRecord;
             console.log("replaced:",this.CachedRecords[imageRecord.rootMultiHash][foundIndex].currentMultiHash)

         }
     }

    getImageRecordsWithMatchingRootHash(hash: string): Promise<import("../interfaces/Data").ImageRecord[]> {
        // console.log("finding image record with hash:", hash);
        // console.log("got imagerecord:",this.CachedRecords[hash][0].rootMultiHash)
        return new Promise<ImageRecord[]> ((resolve, reject) =>  {resolve(this.CachedRecords[hash])});
    }

    add(data: ImageRecord): Promise<string> {
        throw new Error("Method not implemented.");
    }

    removeImageRecord(imageRecord: import("../interfaces/Data").ImageRecord): Promise<string> {
        throw new Error("Method not implemented.");
    }
    addRecordToModifiedAlbumAndUpdateLocation(imageRecord: import("../interfaces/Data").ImageRecord): Promise<string> {
        throw new Error("Method not implemented.");
    }

    constructor() {
        if (WebLogbookAndImageManager.Instance){
            return WebLogbookAndImageManager.Instance;
        }
        WebLogbookAndImageManager.Instance= this;
    }







}
