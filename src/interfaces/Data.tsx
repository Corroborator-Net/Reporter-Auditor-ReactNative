
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
    constructor( public timestamp:Date,
                 public storageLocation:string,
                 public rootMultiHash:string,
                 public currentMultiHash:string,
                 public base64Data:string,
                 exif:any,
    ) {
        this.metadata = JSON.stringify(exif);
        if (!storageLocation.startsWith("file://")){
            this.storageLocation = "file://" + storageLocation;
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
