//@ts-ignore
import {piexif} from "piexifjs";

export interface LogbookStateKeeper {
    CurrentLogbookID:string
    LogbookName(logbookID:string):string
    AvailableLogbooks:string[]
    CurrentSelectedLogs:LogbookEntry[]
}

export class LogbookEntry{

    constructor(public rootLog:Log, public logs:Log[], public imageRecords:ImageRecord[]) {
        // this.logs = _.filter(logs,(log) =>
            // _.some(imageRecords, (imageRecord)=> log.dataMultiHash == imageRecord.currentMultiHash));
        // get all logs that have the same root hash
        this.logs = logs.filter((log)=>log.rootTransactionHash == rootLog.rootTransactionHash);
        // if (this.logs.length>2){console.log(`I have been logged ${this.logs.length} times`)};
    }
    // TODO test the order of this
    get RootLog():Log{
        // console.log("root log hash: ", this.rootLog.dataMultiHash);
        return this.rootLog;
    }

    get Log():Log{
        return this.logs[0]
    }

    get ImageRecord():ImageRecord{
        return this.imageRecords[this.imageRecords.length-1];
    }

    get RootImageRecord():ImageRecord{
        return this.imageRecords[0];
    }


    public IsImageRecordSynced():boolean{
        // console.log("is synced?", this.Log, "record:", this.ImageRecord.currentMultiHash);
        // if they match then the image record has been logged
        return this.Log.dataMultiHash == this.ImageRecord.currentMultiHash &&
            this.Log.currentTransactionHash!= "";
    }
}


export class Log {

    // TODO split into log from blockchain and log to blockchain - i.e. includes or doesn't signedMetadata
    constructor(public logBookAddress:string,
                public storageLocation:string, // log should have location b/c client may not have image storage to match hash to
                public rootTransactionHash:string,
                public currentTransactionHash:string,
                public dataMultiHash:string, //  // raw multihash
                public encryptedMetadataJson:string, // this will include signed Hashes
    ) {
    }


    // TODO: implement me
    public getTimestampsMappedToReporterKeys():Map<string,string[]>{
        const metaObj = JSON.parse(this.encryptedMetadataJson);
        const returnMap = new Map<string,string[]>();
        // returnMap.set(FirstReporterPublicKey, metaObj["0"]);
        return returnMap;

    }

    // TODO: implement me
    public getLocations():Map<string,string[]>{
        // const metaObj = JSON.parse(this.encryptedMetadataJson);
        const returnMap = new Map<string,string[]>();
        // returnMap.set(FirstReporterPublicKey, metaObj["0"]);
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
        logBookAddress: {type:'string', indexed:true},
        storageLocation:'string',
        rootTransactionHash:'string',
        currentTransactionHash:'string',
        dataMultiHash:'string',
        encryptedMetadataJson:'string',
    }
};


export interface HashData{
    currentMultiHash:string;
    storageLocation:string;
    metadata:string;
    base64Data:string;
}

// TODO: storing the entire image in the base64 property is too inefficient a use of space
export class ImageRecord implements HashData {
    public metadata:string;
    public filename:string;
    private exifObject:any;

    constructor( public timestamp:Date,
                 public storageLocation:string,
                 public rootMultiHash:string,
                 public currentMultiHash:string,
                 public base64Data:string,
    ) {
        this.metadata = "";
        if (base64Data != "") {
            this.metadata = this.LoadAndSetExifObjectFromBase64(base64Data);
        }
        if (!storageLocation.startsWith("file://")){
            this.storageLocation = "file://" + storageLocation;
        }
        this.filename = this.storageLocation.slice(this.storageLocation.lastIndexOf("/") + 1);
    }

    public LoadAndSetExifObjectFromBase64(base64Data:string):string{
        const exif = {};
        console.log("loading metadata from jpeg base64 data!");
        // load the exif data for viewing
        this.exifObject = piexif.load(`data:image/jpeg;base64,${base64Data}`);
        for (const ifd in this.exifObject) {
            if (ifd != "thumbnail") {
                for (const tag in this.exifObject[ifd]) {
                    //@ts-ignore
                    exif[piexif.TAGS[ifd][tag]["name"]] = this.exifObject[ifd][tag];
                }
            }
        }

        return JSON.stringify(exif);

    }

    public UpdateExifObject(newImageDescription:string):string{

        this.listExifKeysValues(this.exifObject);

        const oldImageDescription:ImageDescription = JSON.parse(this.exifObject["0th"][270]);

        // TODO: allow user to change logbook
        this.exifObject["0th"][270] = {
            Description: newImageDescription,
            LogbookAddress:oldImageDescription.LogbookAddress,
            PublicKey:oldImageDescription.PublicKey,
        };

        // after editing the exif, dump it into a string
        const exifString = piexif.dump(this.exifObject);

        // OVERWRITE the string into the jpeg - insert is not properly named!
        return piexif.insert(exifString, `data:image/jpeg;base64,${this.base64Data}`);
    }

    GetImageDescription(){

    }

    listExifKeysValues(exifObj:any){
        for (const ifd in exifObj) {
            if (ifd == "thumbnail") {
                continue;
            }
            console.log("-" + ifd);
            for (var tag in exifObj[ifd]) {

                console.log("  " + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
                console.log("ifd:", ifd, "tag:", tag)


            }
        }
    }
}

export type ImageDescription={
    Description:string;
    LogbookAddress:string;
    PublicKey:string;
}


export const ImageRecordSchema = {
    name: 'ImageHash',
    primaryKey: 'currentMultiHash',
    properties: {
        timestamp:  'date',
        currentMultiHash: 'string',
        rootMultiHash: {type:'string', indexed:true},
        storageLocation:'string',
        base64Data:'string',
        metadata:'string',
        filename:'string',
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
