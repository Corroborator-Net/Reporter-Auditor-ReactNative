import {FirstReporterPublicKey} from "../utils/Constants";


export class Log {

    public signedMetadata:string;
    // TODO split into log from blockchain and log to blockchain - i.e. includes or doesn't signedMetadata
    constructor(public logBookAddress:string,
                public storageLocation:string, // log should have location b/c client may not have image storage to match hash to
                public transactionHash:string,
                public dataMultiHash:string, //  // raw multihash
                signedMetadataObj:object|null, // this will include signed Hashes
                signedMetadataJson:string|null
    ) {

        // gotten from atra
        // @ts-ignore
        if (signedMetadataJson && signedMetadataJson["0"] != null){
            this.signedMetadata = signedMetadataJson;
        }
        // sending to atra
        else {
            this.signedMetadata = JSON.stringify({
                "0": JSON.stringify(signedMetadataObj)
            });
        }
       console.log("signed metadata: ", this.signedMetadata);
    }

    // TODO: implement me by adding an index to the metadata, i.e. {"0":{}, "1":{}, "2":{}}
    public appendSignedData(signedMetadata:string){

    }

    // TODO: implement me
    public getTimestampsMappedToReporterKeys():Map<string,string[]>{
        const metaObj = JSON.parse(this.signedMetadata);
        const returnMap = new Map<string,string[]>();
        returnMap.set(FirstReporterPublicKey, metaObj["0"]);
        return returnMap;

    }

    // TODO: implement me
    public getLocations():Map<string,string[]>{
        const metaObj = JSON.parse(this.signedMetadata);
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
        signedMetadata:'string',
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
        // console.log("exif data: " + this.metadata);
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

// export function convertListToCSV(list:string[]):string{
//         let csvString = "";
//         for (const item of list){
//             csvString += item +", "
//         }
//         return csvString.trim();
// }
//
// export function convertCSVToList(csv:string):Map<string,string[]>{
//     let returnMap = new Map<string, string[]>();
//     //TODO: split based on peer signatures
//     let splitList = csv.split(Log.metadataItemSeparator);
//     console.log("metadata split by item separator:", splitList);
//     returnMap.set(FirstReporterPublicKey,splitList);
//     return returnMap;
// }
export const RealmSchemas = [LogSchema, ImageRecordSchema];
