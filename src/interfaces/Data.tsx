//@ts-ignore
import {piexif} from "piexifjs";
import {LogMetadata} from "../shared/LogMetadata";

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
    metadataJSON:string;
}

// TODO: storing the entire image in the base64 property is too inefficient a use of space
export class ImageRecord implements HashData {
    public metadataJSON:string;
    public filename:string;

    constructor( public timestamp:Date,
                 public storageLocation:string,
                 public rootMultiHash:string,
                 public currentMultiHash:string,
                 public base64Data:string,
    ) {
        this.metadataJSON = "";
        if (base64Data != "") {
            this.metadataJSON = ImageRecord.GetMetadataAndExifObject(base64Data)[0];
        }
        if (!storageLocation.startsWith("file://")){
            this.storageLocation = "file://" + storageLocation;
        }
        this.filename = this.storageLocation.slice(this.storageLocation.lastIndexOf("/") + 1);
    }


    public static GetMetadataAndExifObject(base64Data:string):[string, any]{
        const exif = {};
        // console.log("loading metadata from jpeg base64 data!");
        // load the exif data for viewing
        const exifObject = piexif.load(`data:image/jpeg;base64,${base64Data}`);
        // ImageRecord.listExifKeysValues(exifObject)
        for (const ifd in exifObject) {
            if (ifd != "thumbnail") {
                for (const tag in exifObject[ifd]) {
                    //@ts-ignore
                    exif[piexif.TAGS[ifd][tag]["name"]] = exifObject[ifd][tag];
                }
            }
        }
        return [JSON.stringify(exif), exifObject];
    }


    public static GetEditedJpeg(base64Data:string, newImageDescription:string):string{

        let exifObject = ImageRecord.GetMetadataAndExifObject(base64Data)[1];
        ImageRecord.listExifKeysValues(exifObject);
        let oldImageDescription:ImageDescriptionExtraInformation = JSON.parse(exifObject["0th"][270]);

        const imageDescriptionExtraInformation:ImageDescriptionExtraInformation ={
            Description: newImageDescription,
            LogbookAddress:oldImageDescription.LogbookAddress,
            SignedLogbookAddress:oldImageDescription.SignedLogbookAddress,
            // GPSAccuracy:oldImageDescription.GPSAccuracy
            // PublicKey:oldImageDescription.PublicKey,
        }
        // TODO: allow user to change logbook
        exifObject["0th"][270] = JSON.stringify(imageDescriptionExtraInformation);
        // console.log("exifob:", exifObject["0th"][270]);

        // after editing the exif, dump it into a string
        const exifString = piexif.dump(exifObject);

        // OVERWRITE the string into the jpeg - insert is not properly named!
        return piexif.insert(exifString, `data:image/jpeg;base64,${base64Data}`);
    }


    // Realm doesn't play nice with instance functions
    public static GetImageDescription(imageRecord:ImageRecord):ImageDescriptionExtraInformation{
        return JSON.parse(JSON.parse(imageRecord.metadataJSON)[LogMetadata.ImageDescription]);
    }


    static listExifKeysValues(exifObj:any){
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

export type ImageDescriptionExtraInformation={
    Description:string;
    LogbookAddress:string;
    // do they need a public key? anyone can check the chain for the hash and see the key that reported it
    // PublicKey:string;
    // GPSAccuracy:number
    SignedLogbookAddress:string;
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
        metadataJSON:'string',
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
