//@ts-ignore
import {piexif} from "piexifjs";
import {LogMetadata} from "../shared/LogMetadata";


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




export type LogbookAndSection ={
    title:string
    logs:Log[]
}



export class RevisionNode {
    static readonly placeHolderImage:ImageRecord = new ImageRecord(
        new Date(),"","","","/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAGKADAAQAAAABAAAAGAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAGAAYAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwQDAwMEBQQEBAQFBwUFBQUFBwgHBwcHBwcICAgICAgICAoKCgoKCgsLCwsLDQ0NDQ0NDQ0NDf/bAEMBAgICAwMDBgMDBg0JBwkNDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDf/dAAQAAv/aAAwDAQACEQMRAD8A/Zb4+6z4y0P4YaneeBYp31NmiiMlsheaGGRsSSIq5OQOMgZXO7jGa+WPi74P03T/AIFeGviLDp03h/xVEbIXMyvJHdSvMhEhlZm3l2ZRICx3r0z1r9Da+evih4AuPjD4tsvB+pXMln4a0KGHUr4Q8S3lzctLHFEpPCiNI3LNyfnAAzyAC/8As4eLvEHjX4Vafq3iV2nvIpp7X7S/37iOFsK7Hu38JPcrk85r3asvRdF0vw7pNroeiWyWljZRiKCGMYVFH6kk8knkkknmtSgD/9D9/K+RPAfxp+JPiL46an4B1fRo4NIt5buMhYXWW1jg3eVK8hJDCTAHTB3Ar7/XdfJHw/8A+TnfG/8A15r/ADjoA+t6KKKAP//Z"
        );

    public imageRecordIsBlank:boolean;
    public imageRecord:ImageRecord;
    constructor(public log:Log,
                public corroboratingLogs:Log[],
                imageRecord:ImageRecord|null) {
        if (!imageRecord){
            this.imageRecord = RevisionNode.placeHolderImage;
            this.imageRecordIsBlank=true;
        }
        else{
            this.imageRecordIsBlank=false;
            this.imageRecord=imageRecord
        }
    }
}



export class LogbookEntry{

    public RevisionsInOrder:RevisionNode[]=[];

    getCorroboratingLogs(log:Log,logs:Log[]):Log[]{
        return logs.filter((potentialCorroboratingLog)=>
            // a corroborating log has its root and current multihash equal to each other
            potentialCorroboratingLog.rootDataMultiHash == potentialCorroboratingLog.currentDataMultiHash
            // and they both equal the log's current hash
            && potentialCorroboratingLog.currentDataMultiHash == log.currentDataMultiHash)
    }

    getTrunkLogsInOrder(rootLog:Log, logs:Log[]):Log[]{
        return (logs.filter((log)=>log.rootDataMultiHash == rootLog.rootDataMultiHash)
            .sort((log1, log2)=>{
            return log1.blockTimeOrLocalTimeOrBlockNumber - log2.blockTimeOrLocalTimeOrBlockNumber}));
    }

    //TODO: pick out the edited image so we can keep it around, as of now it's not being found b/c
    // it doesn't belong to a log.
    constructor(public rootLog:Log, logs:Log[], public imageRecords:ImageRecord[]) {
        // this.logs = _.filter(logs,(log) =>
            // _.some(imageRecords, (imageRecord)=> log.dataMultiHash == imageRecord.currentMultiHash));

        if (imageRecords.length==0){
            console.log("WARNING: you didn't give me any image records")
        }

        // get all logs that have the same root hash
        let trunkLogs = this.getTrunkLogsInOrder(rootLog, logs);

        //TODO SHOULD CONTAIN THE ROOT LOG!
        console.log( "TRUNK LOGS CONTAINS ROOT LOG?",trunkLogs.filter(log=>log==rootLog).length>0);

        let index =0;
        for (const trunkLog of trunkLogs){
            console.log("creating revision node at time (make sure I'm in order):",trunkLog.blockTimeOrLocalTimeOrBlockNumber);
            const imageRecord = this.imageRecords.filter((imageRecord)=>{
                return imageRecord.currentMultiHash == trunkLog.currentDataMultiHash
            })[0];
            this.RevisionsInOrder.push(new RevisionNode(
                trunkLog,
                this.getCorroboratingLogs(trunkLog,logs),
                imageRecord
            ))

        }
    }


    // TODO test the order of this
    get RootLog():Log{
        // console.log("root log hash: ", this.rootLog.dataMultiHash);
        return this.rootLog;
    }

    get HeadLog():Log{
        return this.RevisionsInOrder[this.RevisionsInOrder.length-1].log
    }

    //TODO: right now we're assuming that the head image log is always the one that will be edited. This might not be
    // true from the auditor side. They may want to edit a root image record. I think we can safely ignore this possibility
    // for now, though, as the reporter only keeps copies of the original and modified and none in between.
    get HeadImageRecord():ImageRecord{
        return this.RevisionsInOrder[this.RevisionsInOrder.length-1].imageRecord;
    }

    get RootImageRecord():ImageRecord{
        return this.RevisionsInOrder[0].imageRecord;
    }


    public IsImageRecordSynced():boolean{
        // console.log("is synced?", this.Log, "record:", this.ImageRecord.currentMultiHash);
        // if they match then the image record has been logged
        return this.HeadLog.currentDataMultiHash == this.HeadImageRecord.currentMultiHash &&
            this.HeadLog.currentTransactionHash!= "";
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
                public loggingPublicKey:string,
                public blockTimeOrLocalTimeOrBlockNumber:number,
    ) {
    }

    static GetAllLogsInTreeFromAnyLogInTree(logsWithMatchingHashes:Log[], allLogsSharingLogbook:Log[]):[Log[], Log]{

        // console.log("all logs",JSON.stringify(allLogsSharingLogbook, null, 2));

        // get log in trunk for revision branch
        const originalLog = Log.GetEarliestLogViaBlockNumber(logsWithMatchingHashes);
        // console.log("got trunk log from all logs in logbook",JSON.stringify(originalLog, null, 2) );
        // get all logs in trunk
        const trunkLogs =  allLogsSharingLogbook.filter((log)=>
            log.rootDataMultiHash == originalLog.rootDataMultiHash);

        // console.log("got all trunk logs",JSON.stringify(trunkLogs, null, 2) );

        let entireTree:Log[]=trunkLogs.slice();
        // get all branches and add them to the entire tree array
        for (const trunkLog of trunkLogs){
            entireTree.concat(allLogsSharingLogbook.filter(logAlongBranch=>
                logAlongBranch.rootDataMultiHash == trunkLog.currentDataMultiHash))
        }
        return [entireTree, originalLog];

    }

    // TODO: what if the files have the same block number?
    static GetEarliestLogViaBlockNumber(logs:Log[]):Log{
        return logs.reduce(function(prev, curr) {
            return prev.blockTimeOrLocalTimeOrBlockNumber < curr.blockTimeOrLocalTimeOrBlockNumber ? prev : curr;
        });
    }

    // TODO: assumes the user isn't corroborating their own logs
    static GetRootLogsByFirstLoggedPublicKey(logs:Log[]):Log[]{
        // getting the logs from the web, should contain block time
        if (logs[0] && logs[0].blockTimeOrLocalTimeOrBlockNumber) {
            // get the earliest log
            const firstLog = Log.GetEarliestLogViaBlockNumber(logs);
            return logs.filter(log=>log.rootTransactionHash == log.currentTransactionHash &&
                                log.loggingPublicKey == firstLog.loggingPublicKey)
        }
        else{
            return logs.filter(log=>log.rootTransactionHash == log.currentTransactionHash);
        }

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
        loggingPublicKey:'string',
        blockTimeOrLocalTimeOrBlockNumber:'int',
    }
};


export interface HashData{
    currentMultiHash:string;
    storageLocation:string;
    metadataJSON:string;
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
