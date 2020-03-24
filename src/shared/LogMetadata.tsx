// @ts-ignore
import { Crypt } from 'hybrid-crypto-js';

// created via npm library: hybrid-crypto-js
export class RSAKeysToEncryptedAESKeyToCipherMap{
    constructor(public v:string,
                public iv:string,
                // the keys is a map that allows the multiple rsa public key encryption:
                // each pub key maps to the same AES key encrypted with the RSA pub key
                // so if you have any of the matching private keys to a key in the keys list, you can get the AES key
                public keys:{[pubKey:string] :string},
                cipher:string,
                signature:string ) {
    }
}
//
// class PeerLogMetadataEntry{
//     // map a reporter's public key to their AES:EncryptedJSON entry
//     pubKeyToMetadataAndAESKeyMap:{[pubKey: string]: RSAKeysToEncryptedAESKeyToCipherMap};
//     constructor(public myPublicKey:string, public metadataEntry:RSAKeysToEncryptedAESKeyToCipherMap) {
//         this.pubKeyToMetadataAndAESKeyMap= {[myPublicKey]:metadataEntry}
//     }
// }

export class LogMetadata {
    // custom metadata tags:
    public static readonly DateTag = "DateTime";
    public static readonly GPSLat = "GPSLatitude";
    public static readonly GPSLong = "GPSLongitude";
    public static readonly GPSAcc = "GPSAccuracy";
    public static readonly GPSAlt = "GPSAltitude";
    public static readonly GPSSpeed = "GPSSpeed";
    public static readonly ImageDescription = "ImageDescription";
    public static readonly BlockTime = "BlockTime";
    public static readonly FileName = "FileName";
    private static readonly SignedHash = "SignedHash";
    public static readonly MetadataTags = [LogMetadata.DateTag, LogMetadata.ImageDescription, LogMetadata.GPSLat,
        LogMetadata.GPSLong, LogMetadata.GPSAcc, LogMetadata.GPSAlt, LogMetadata.GPSSpeed, LogMetadata.FileName,
        LogMetadata.SignedHash, LogMetadata.BlockTime];


    public pubKeysToAESKeysToJSONDataMap: { [name: string]: any };
    private static crypt = new Crypt({ md:'sha256' });

    // retrieve from blockchain or image exif, turn into json that we want
    constructor(
        // PUSH DATA ARGUMENTS
        myJsonData: string | null, myKey: string | null, trustedRSAKeys:string[]|null,
        // PULL DATA ARGUMENTS
        jsonDataToDecrypt: string | null, publicKeysThatReportedData: string[] | null, privateKeyToDecryptMetadataWith:string|null) {
        this.pubKeysToAESKeysToJSONDataMap = {};

        // PULLING DATA FROM OTHER LOG - optional decryption
        if (jsonDataToDecrypt && publicKeysThatReportedData) {
            const peerMetadata = JSON.parse(jsonDataToDecrypt);
            // console.log("got peer metadata: ", peerMetadata);
            // parsing data gotten from atra
            for (const publicKey of publicKeysThatReportedData) {
                // With prior knowledge of your reporters' or peers' keys, find metadata they've encrypted already and add it
                if (peerMetadata[publicKey]) {

                    // TODO: user must pass a key with which to decrypt the metadata!
                    if (privateKeyToDecryptMetadataWith){
                        const RSAKeysToEncryptedAESKeyToCipherMap = peerMetadata[publicKey];
                        // console.log("this should be a RSAKeysToEncryptedAESKeyToCipherMap :", RSAKeysToEncryptedAESKeyToCipherMap);
                        try {
                            const decrypted = LogMetadata.crypt.decrypt(privateKeyToDecryptMetadataWith, RSAKeysToEncryptedAESKeyToCipherMap);
                            this.pubKeysToAESKeysToJSONDataMap[publicKey] = decrypted.message;
                        }
                        catch (e) {
                            console.log("couldn't decrypt the cipher with the private key supplied", e);
                        }
                    }
                    else{
                        this.pubKeysToAESKeysToJSONDataMap[publicKey] = peerMetadata[publicKey];
                    }

                }
            }
        }

        // PUSHING NEW DATA TO A LOG - accepts json string and will package it into a RSAKeysToEncryptedAESKeyToCipherMap
        if (myJsonData && myKey) {
            const metadata = JSON.parse(myJsonData);
            const jsonToEncrypt:{[key:string]:string} = {};
            //  add your own
            for (const tag of LogMetadata.MetadataTags) {
                jsonToEncrypt[tag] = metadata[tag];
            }
            // either we use the trusted keys in additon to ours, or we just use ours
            let keysWithWhichToEncrypt = [myKey];
            if (trustedRSAKeys){
                trustedRSAKeys.push(myKey);
                keysWithWhichToEncrypt = trustedRSAKeys;
            }

            // console.log("encrypting with:", keysWithWhichToEncrypt);
            // the encrypt function returns an object of type: RSAKeysToEncryptedAESKeyToCipherMap
            this.pubKeysToAESKeysToJSONDataMap[myKey] =
                LogMetadata.crypt.encrypt(keysWithWhichToEncrypt, JSON.stringify(jsonToEncrypt));

        }

    }

    public JsonData(): string {
        return (JSON.stringify(this.pubKeysToAESKeysToJSONDataMap));
    }

    public appendSignedData(signedMetadata: LogMetadata) {

    }

}