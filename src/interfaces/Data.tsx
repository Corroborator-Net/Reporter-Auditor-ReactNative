export interface HashData{
    multiHash:string;
    transactionHash:string | null;
    base64Data:string;
}

export class Log {
    constructor(public logBookAddress:string,
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
        dataMultiHash:'string',
        signedHashes:'string[]',
        signedMetadata:'string[]',
    }
}



class exif {
    [name: string]: any
}

export class ImageRecord implements HashData {
    public exif:string;
    constructor( public timestamp:Date,
                 public base64Data:string,
                 public multiHash:string,
                 public pictureOrientation: number,
                 public deviceOrientation: number,
                 exif: exif,
                 public transactionHash:string | null,
    ) {
        // TODO concatenate all the exif data into a string for now
        this.exif = exif.toString();
        console.log("exif is: " + this.exif);
    }
}

export const ImageRecordSchema = {
    name: 'ImageHash',
    properties: {
        timestamp:  'date',
        multiHash: 'string',
        base64ImageData:'string',
        pictureOrientation:'int',
        deviceOrientation:'int',
        exif:'string',
        transactionHash: 'string?',
    }
};
