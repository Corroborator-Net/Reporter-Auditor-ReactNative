// @ts-ignore
import { Crypt } from 'hybrid-crypto-js';
import {Identity} from "../interfaces/Identity";
import {ImageDescriptionExtraInformation} from "../interfaces/Data";

// created via npm library: hybrid-crypto-js
// export class RSAKeysToEncryptedAESKeyToCipherMap{
//     constructor(public v:string,
//                 public iv:string,
//                 // the keys is a map that allows the multiple rsa public key encryption:
//                 // each pub key maps to the same AES key encrypted with the RSA pub key
//                 // so if you have any of the matching private keys to a key in the keys list, you can get the AES key
//                 public keys:{[pubKey:string] :string},
//                 cipher:string,
//                 signature:string ) {
//     }
// }


export class LogMetadata {
    // custom metadata tags:
    public static readonly DateTag = "DateTime";
    public static readonly GPSLat = "GPSLatitude";
    public static readonly GPSLong = "GPSLongitude";
    public static readonly GPSAlt = "GPSAltitude";
    
    public static readonly GPSAccuracyReplacement = "GPSDifferential";

    public static readonly ImageDescription = "ImageDescription";
    // public static readonly FileName = "FileName";
    public static readonly SignedHash = "SignedHash";
    public static readonly MetadataTagsToIncludeOnChain = [LogMetadata.DateTag, LogMetadata.ImageDescription,
        LogMetadata.GPSLat, LogMetadata.GPSLong,  LogMetadata.GPSAlt, LogMetadata.SignedHash,
        LogMetadata.GPSAccuracyReplacement];


    private readonly encryptedData:string;
    private static crypt = new Crypt({ md:'sha256' });

    // retrieve from blockchain or image exif, turn into json that we want
    constructor(
        // PUSH DATA ARGUMENTS
        myJsonData: string | null, myKeys: Identity | null,  hashToSign:string|null,
        // PULL DATA ARGUMENTS
        jsonDataToDecrypt: string | null, privateKeyToDecryptMetadataWith:string|null) {

        this.encryptedData = jsonDataToDecrypt ? jsonDataToDecrypt : "";
        // PULLING DATA FROM OTHER LOG - optional decryption
        if (jsonDataToDecrypt && privateKeyToDecryptMetadataWith) {
            // let jsonData;
            // try{
            //     jsonData = jsonDataToDecrypt;
            //     console.log("json data parsed:", jsonData);
            // }
            // catch (error) {
            //     console.log("json data an object and not a string", error);
            //     jsonData = jsonDataToDecrypt;
            // }

            // console.log("got peer metadata: ", peerMetadata);
            // TODO: user must pass a key with which to decrypt the metadata!
            if (privateKeyToDecryptMetadataWith){
                // console.log("this should be a RSAKeysToEncryptedAESKeyToCipherMap :", RSAKeysToEncryptedAESKeyToCipherMap);
                try {
                    const decrypted = LogMetadata.crypt.decrypt(privateKeyToDecryptMetadataWith, jsonDataToDecrypt);
                    this.encryptedData = decrypted.message;
                }
                catch (e) {
                    console.log("couldn't decrypt the cipher with the private key supplied", e);
                }
            }
        }

        // PUSHING NEW DATA TO A LOG - accepts json string and will package it into a RSAKeysToEncryptedAESKeyToCipherMap
        if (myJsonData && myKeys) {
            const metadata = JSON.parse(myJsonData);
            // must include signed hash
            metadata[LogMetadata.SignedHash] = LogMetadata.crypt.signature(myKeys.PrivatePGPKey, hashToSign);

            const jsonToEncrypt:{[key:string]:string} = {};
            //  extract the metadata we want on chain from the jpeg's whole lot of metadata
            for (const tag of LogMetadata.MetadataTagsToIncludeOnChain) {

                // ignore empty tags i.e. when we're corroborating another image/log
                if (!metadata[tag]){
                    continue;
                }
                if (tag == LogMetadata.ImageDescription){
                    // let's just log the actual description on chain
                    const extraInfo:ImageDescriptionExtraInformation = JSON.parse(metadata[tag]);
                    jsonToEncrypt[tag] = extraInfo.Description;
                    continue;
                }
                jsonToEncrypt[tag] = metadata[tag];
            }
            // either we use the trusted keys in additon to ours, or we just use ours
            let keysWithWhichToEncrypt = myKeys.TrustedPeerPGPKeys.slice();

            keysWithWhichToEncrypt.push(myKeys.PublicPGPKey);
            // console.log("encrypting to put on chain:", jsonToEncrypt);
            // the encrypt function returns an object of type: RSAKeysToEncryptedAESKeyToCipherMap
            this.encryptedData =
                LogMetadata.crypt.encrypt(keysWithWhichToEncrypt, JSON.stringify(jsonToEncrypt));

        }

    }

    public JsonData(): string {
        return this.encryptedData;
    }


}
