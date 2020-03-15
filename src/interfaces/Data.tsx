import {FirstReporterPublicKey} from "../utils/Constants";

export interface LogbookStateKeeper {
    CurrentLogbook:string
    AvailableLogbooks:string[]
}


export class LogMetadata {
    // custom metadata tags:
    public static readonly DateTag = "DateTime";
    public static readonly GPSLat = "GPSLatitude";
    public static readonly GPSLong = "GPSLongitude";
    public static readonly GPSAcc = "GPSAccuracy";
    public static readonly GPSAlt = "GPSAltitude";
    public static readonly GPSSpeed = "GPSSpeed";
    public static readonly ImageDescription = "ImageDescription";
    public static readonly BlockTime = "BlockTime";
    public static readonly FileName = "FileName";
    private static readonly SignedHash = "SignedHash";
    public static readonly MetadataTags = [ LogMetadata.DateTag, LogMetadata.ImageDescription, LogMetadata.GPSLat,
        LogMetadata.GPSLong, LogMetadata.GPSAcc, LogMetadata.GPSAlt, LogMetadata.GPSSpeed, LogMetadata.FileName,
        LogMetadata.SignedHash, LogMetadata.BlockTime];


    public jsonObj: { [name: string]: any };
    // retrieve from blockchain or image exif, turn into json that we want
    constructor(jsonData:string, signedHash:string|null) {
        const metadata = JSON.parse(jsonData);

        // parsing data gotten from atra
        if (metadata["0"] != null){
            this.jsonObj = metadata;
            return
        }

        // starting from scratch
        this.jsonObj = {"0": {} };
        for (const tag of LogMetadata.MetadataTags){
            this.jsonObj["0"][tag]=metadata[tag];
        }
        if (signedHash!=null){
            this.jsonObj["0"][LogMetadata.SignedHash] = signedHash;
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
                public originalTransactionHash:string,
                public currentTransactionHash:string,
                public dataMultiHash:string, //  // raw multihash
                public signedMetadataJson:string, // this will include signed Hashes
    ) {
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
        originalTransactionHash:'string',
        currentTransactionHash:'string',
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
    primaryKey: 'multiHash',
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
export class UserPreference{
    constructor(public UserPublicKey:string,
                public Key:string,
                public Preference:string[] ) {
    }
}

export const UserPreferenceSchema ={
    name:"UserPreference",
    primaryKey:"Key",
    properties:{
        UserPublicKey:"string",
        Key:"string",
        Preference:"string[]",
    }
}

export const RealmSchemas = [LogSchema, ImageRecordSchema, UserPreferenceSchema];
