//@ts-ignore
import {piexif} from "piexifjs";
import {LogMetadata} from "../shared/LogMetadata";

export type LogbookAndSection ={
    title:string
    logs:Log[]
}

export class LogbookEntry{

    constructor(public rootLog:Log, public logs:Log[], public imageRecords:ImageRecord[]) {
        // this.logs = _.filter(logs,(log) =>
            // _.some(imageRecords, (imageRecord)=> log.dataMultiHash == imageRecord.currentMultiHash));

        // get all logs that have the same root hash
        this.logs = logs.filter((log)=>log.rootDataMultiHash == rootLog.rootDataMultiHash);
        //TODO: we want to separate out logs that have different public keys than the original logger.
        // so first is to find the true root log, that log that has the current == root transaction hash
        // as well as the data multihashes == each other.

        // TODO: why check for empty root hash? - I think for the completely new logs that a user uploads
        //         && rootLog.rootTransactionHash!="");

        // if we're passed empty logs, just use the root log as the only logs
        if (this.logs.length==0){
            this.logs = [rootLog];
        }

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
        return this.Log.currentDataMultiHash == this.ImageRecord.currentMultiHash &&
            this.Log.currentTransactionHash!= "";
    }
}


export class Log {

    // TODO split into log from blockchain and log to blockchain - i.e. includes or doesn't signedMetadata
    constructor(public logBookAddress:string,
                public storageLocation:string, // log should have location b/c client may not have image storage to match hash to
                public rootTransactionHash:string,
                public currentTransactionHash:string,
                public rootDataMultiHash:string, // pointer to the root multihash
                public currentDataMultiHash:string, //  // raw multihash
                public encryptedMetadataJson:string, // this will include signed Hashes
    ) {
    }


    // TODO: implement me
    public getTimestampsMappedToReporterKeys():Map<string,string[]>{
        // const metaObj = JSON.parse(this.encryptedMetadataJson);
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
    primaryKey: 'currentDataMultiHash',
    properties:{
        logBookAddress: {type:'string', indexed:true},
        storageLocation:'string',
        rootTransactionHash:'string',
        currentTransactionHash:'string',
        rootDataMultiHash:'string',
        currentDataMultiHash:'string',
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
        // ImageRecord.listExifKeysValues(exifObject);
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
    public static GetExtraImageInformation(imageRecord:ImageRecord):ImageDescriptionExtraInformation|undefined{
        try {
           return JSON.parse(JSON.parse(imageRecord.metadataJSON)[LogMetadata.ImageDescription]);
        }catch (e) {
            return undefined
        }
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
