
export class Log {
    constructor(public logBookAddress:string,
                public reporterAddress:string,
                public storageLocation:string, // log should have location b/c client may not have image storage to match hash to
                public transactionHash:string,
                public dataMultiHash:string, //  // raw multihash
                public signedHashes:string,  // signed by each other corroborator's private ID key + Hq's public key
                public signedMetadata:string  // signed by each other corroborator's private ID key + Hq's public key
    ) {
    }

    static blankEntryToSatisfyAtra=",";
    // TODO: implement me
    public appendSignedData(signedHash:string, signedMetadata:string){

    }
}

export interface HashReceiver{
    OnHashProduced(hashData:HashData):void;
}

export const LogSchema = {
    name:"LogSchema",
    primaryKey: 'dataMultiHash',
    properties:{
        logBookAddress:'string',
        reporterAddress:'string',
        storageLocation:'string',
        transactionHash:'string',
        dataMultiHash:'string',
        signedHashes:'string',
        signedMetadata:'string',
    }
};

export interface HashData{
    multiHash:string;
    storageLocation:string;
}

export class ImageRecord implements HashData {
    public exif:string;
    constructor( public timestamp:Date,
                 public storageLocation:string,
                 public multiHash:string,
                 public pictureOrientation: number,
                 public deviceOrientation: number,
                 public thumbnail:string,
                 exif:any,
    ) {
        let exifString = "";
        const keys = Object.keys(exif);
        for (const key of keys){
            exifString+= key +":"+exif[key]+", "
        }
        this.exif = exifString.trim();
        // console.log("exif data: " + this.exif);
    }
}

export const ImageRecordSchema = {
    name: 'ImageHash',
    primaryKey: 'storageLocation',
    properties: {
        timestamp:  'date',
        multiHash: 'string',
        storageLocation:'string',
        pictureOrientation:'int',
        deviceOrientation:'int',
        thumbnail:'string',
        exif:'string',
    }
};

export function convertListToCSV(list:string[]):string{
        let csvString = "";
        for (const item of list){
            csvString += item +", "
        }
        return csvString.trim();
}
export const RealmSchemas = [LogSchema, ImageRecordSchema];
