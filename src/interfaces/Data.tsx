import {FirstReporterPublicKey} from "../utils/Constants";

export class Log {

    static metadataItemSeparator= "&";
    static metadataReportSeparator=",";
    static blankEntryToSatisfyAtra=",";

    public signedMetadata:string;
    constructor(public logBookAddress:string,
                public storageLocation:string, // log should have location b/c client may not have image storage to match hash to
                public transactionHash:string,
                public dataMultiHash:string, //  // raw multihash
                public signedHashes:string,  // signed by each other corroborator's private ID key + Hq's public key
                signedDate:Date|null,
                signedLocation:string|null,  // signed by each other corroborator's private ID key + Hq's public key
                signedMetadata:string|null
    ) {
        if (signedMetadata != null){
            // TODO: parse data from blockchain for auditor
            this.signedMetadata = signedMetadata;
        }
        if (signedDate != null) {
            this.signedMetadata =
                Log.getFormattedDateString(signedDate) +
                Log.metadataItemSeparator +
                signedLocation +
                Log.metadataReportSeparator;
            // console.log("new log metadata: ", this.signedMetadata);
        }
        else{
            console.log("setting metadata blank");
            this.signedMetadata = Log.blankEntryToSatisfyAtra;
        }
    }

    // TODO: implement me
    public appendSignedData(signedHash:string, signedMetadata:string){

    }

    public getTimestampsMappedToReporterKeys():Map<string,string[]>{
        return convertCSVToList(this.signedMetadata);

    }

    public getLocations():Map<string,string[]>{
        return convertCSVToList(this.signedMetadata);
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
        // reporterAddress:'string',
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

export function convertCSVToList(csv:string):Map<string,string[]>{
    let returnMap = new Map<string, string[]>();
    //TODO: split based on peer signatures
    let splitList = csv.split(Log.metadataItemSeparator);
    console.log("metadata split by item separator:", splitList);
    returnMap.set(FirstReporterPublicKey,splitList);
    return returnMap;
}
export const RealmSchemas = [LogSchema, ImageRecordSchema];
