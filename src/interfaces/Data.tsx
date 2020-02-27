export interface HashData{
    multiHash:string;
    transactionHash:string | null;
    location:string;
}

export class Log {
    constructor(public logBookAddress:string,
                public reporterAddress:string,
                public dataMultiHash:string, //  // raw multihash
                public signedHashes:string[],  // signed by each other corroborator's private ID key + Hq's public key
                public signedMetadata:string[]  // signed by each other corroborator's private ID key + Hq's public key
    ) {
    }
}

export interface HashReceiver{
    OnHashProduced(hashData:HashData):void;
}

export const LogSchema = {
    name:"LogSchema",
    properties:{
        logBookAddress:'string',
        reporterAddress:'string',
        dataMultiHash:'string',
        signedHashes:'string[]',
        signedMetadata:'string[]',
    }
}



class exif {

}

export class ImageRecord implements HashData {
    public exif:string;
    constructor( public timestamp:Date,
                 public location:string,
                 public multiHash:string,
                 public pictureOrientation: number,
                 public deviceOrientation: number,
                 exif:any,
                 public transactionHash:string | null,
    ) {
        let exifString = "";
        const keys = Object.keys(exif);
        for (const key of keys){
            exifString+= key +":"+exif[key]+", "
        }
        this.exif = exifString.trim();
        console.log("exif data: " + this.exif);
    }
}

export const ImageRecordSchema = {
    name: 'ImageHash',
    properties: {
        timestamp:  'date',
        multiHash: 'string',
        location:'string',
        pictureOrientation:'int',
        deviceOrientation:'int',
        exif:'string',
        transactionHash: 'string?',
    }
};
