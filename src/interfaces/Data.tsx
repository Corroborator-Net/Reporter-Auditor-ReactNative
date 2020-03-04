import {FirstReporterPublicKey} from "../utils/Constants";

export class LogMetadata {
    public static GPSLat = "GPSLatitude";
    public static GPSLong = "GPSLongitude";
    public static GPSAcc = "GPSAccuracy";
    public static DateTag = "DateTime";
    public static Comment = "UserComment";
    public static SignedHash = "SignedHash";
    public static MetadataTags = [LogMetadata.GPSAcc, LogMetadata.GPSLat, LogMetadata.GPSLong, LogMetadata.DateTag,
        LogMetadata.Comment, LogMetadata.SignedHash];

    public jsonObj:object;
    // retrieve from blockchain or image exif, turn into json that we want
    constructor(jsonData:string, signedHash:string|null) {
        const metadata = JSON.parse(jsonData);

        // parsing data gotten from atra
        if (metadata["0"] != null){
            this.jsonObj = metadata;
            return
        }

        // starting from scratch
        this.jsonObj= {"0": {} };
        for (const tag of LogMetadata.MetadataTags){
            console.log("tag: ", tag);
            // @ts-ignore
            this.jsonObj["0"][tag]=metadata[tag];
        }
        if (signedHash!=null){
            // @ts-ignore
            this.jsonObj["0"][LogMetadata.SignedHashes] = signedHash;
        }
    }

    public JsonData():string{
        return (JSON.stringify(this.jsonObj));
    }

    // TODO: implement me by adding an index to the metadata, i.e. {"0":{}, "1":{}, "2":{}}
    public appendSignedData(signedMetadata:LogMetadata){

    }


}
export class Log {

    // TODO split into log from blockchain and log to blockchain - i.e. includes or doesn't signedMetadata
    constructor(public logBookAddress:string,
                public storageLocation:string, // log should have location b/c client may not have image storage to match hash to
                public transactionHash:string,
                public dataMultiHash:string, //  // raw multihash
                public signedMetadataJson:string, // this will include signed Hashes
    ) {
       console.log("signed metadata: ", this.signedMetadataJson);
    }



    // TODO: implement me
    public getTimestampsMappedToReporterKeys():Map<string,string[]>{
        const metaObj = JSON.parse(this.signedMetadataJson);
        const returnMap = new Map<string,string[]>();
        returnMap.set(FirstReporterPublicKey, metaObj["0"]);
        return returnMap;

    }

    // TODO: implement me
    public getLocations():Map<string,string[]>{
        const metaObj = JSON.parse(this.signedMetadataJson);
        const returnMap = new Map<string,string[]>();
        returnMap.set(FirstReporterPublicKey, metaObj["0"]);
        return returnMap;
    }

    static getFormattedDateString(date:Date) {
        // 12 Nov 2019 23:16:01
        // const day = date.toLocaleString('default', {
        //     day: 'numeric',
        //     timeZone: "UTC"
        // });
        const formattedDate = date.toLocaleString('default', {
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            // hc: "h24",
            hour12: false,
            timeZone: "UTC"
        }).replace(',', '');

        // console.log("day:",day);
        // console.log("mon:",formattedDate);
        return  formattedDate
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
        storageLocation:'string',
        transactionHash:'string',
        dataMultiHash:'string',
        signedMetadataJson:'string',
    }
};

export interface HashData{
    multiHash:string;
    storageLocation:string;
    metadata:string;
}

export class ImageRecord implements HashData {
    public metadata:string;
    constructor( public timestamp:Date,
                 public storageLocation:string,
                 public multiHash:string,
                 public pictureOrientation: number,
                 public deviceOrientation: number,
                 public thumbnail:string,
                 exif:any,
    ) {
        this.metadata = JSON.stringify(exif);
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
        metadata:'string',
    }
};


export const RealmSchemas = [LogSchema, ImageRecordSchema];
