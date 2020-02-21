
export type LogTransaction = {
    dataMultiHash:string; // raw multihash
    signedHashes:[string] // signed by each other corroborator's private ID key
    encryptedMetadata:[string] // encrypted by each other corroborator with their private ID key and Hq's public key
}

export interface LogbookDatabase {
    getRecordsFor(logBookAddress:string) : [LogTransaction];
    // TODO what should the returned promise contain?
    addNewRecord(logBookAddress:string, newRecord:LogTransaction) : Promise<string>;
}
export interface PeerDatabase {
    isTrusted(peerAddress:string) : boolean;
    getAllTrustedPeers():[string];
    trust(peerAddress:string):null;
}

export interface ImageDatabase {
    add(picture:ImageRecord): Promise<string>;
}

class exif {
    [name: string]: any
}
export class ImageRecord  {
    public exif:string;
    constructor( public timestamp:Date,
                 public multiHash:string,
                 public base64ImageData:string,
                 public pictureOrientation: number,
                 public deviceOrientation: number,
                 exif: exif,
                 public transactionHash:string | null,
) {
        // concatenate all the exif data into a string for now
        this.exif = exif.toString();
        console.log(this.exif);
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
