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

export type LogMetadataFormat = {
    publicKeyToEncryptedData: { [publicKey: string]: any };
}

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


    private logMetadata:LogMetadataFormat;
    private static crypt = new Crypt({ md:'sha256' });

    // retrieve from blockchain or image exif, turn into json that we want
    constructor(
        // PUSH DATA ARGUMENTS
        myJsonData: string | null, myKeys: Identity | null,  hashToSign:string|null,
        // PULL DATA ARGUMENTS
        jsonDataToDecrypt: string | null, publicKeysThatReportedData: string[] | null, privateKeyToDecryptMetadataWith:string|null) {
        this.logMetadata = {publicKeyToEncryptedData:{}};

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
                            this.logMetadata.publicKeyToEncryptedData[publicKey] = decrypted.message;
                        }
                        catch (e) {
                            console.log("couldn't decrypt the cipher with the private key supplied", e);
                        }
                    }
                    else{
                        this.logMetadata.publicKeyToEncryptedData[publicKey] = peerMetadata[publicKey];
                    }

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

            keysWithWhichToEncrypt.push(TestPEMKey.publicKey);
            // keysWithWhichToEncrypt.push(myKeys.PublicPGPKey);

            // console.log("encrypting to put on chain:", jsonToEncrypt);
            // the encrypt function returns an object of type: RSAKeysToEncryptedAESKeyToCipherMap
            this.logMetadata.publicKeyToEncryptedData[TestPEMKey.publicKey] =
            // this.logMetadata.publicKeyToEncryptedData[myKeys.PublicPGPKey] =
                LogMetadata.crypt.encrypt(keysWithWhichToEncrypt, JSON.stringify(jsonToEncrypt));

        }

    }

    public JsonData(): string {
        return (JSON.stringify(this.logMetadata.publicKeyToEncryptedData));
    }


}
const TestPEMKey={privateKey: "-----BEGIN RSA PRIVATE KEY----- MIIEpAIBAAKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQABAoIBAQCBw9/TkfcWfzLe5/Eoj9L/rjr5c9a8QpNi3qS91Tk0WOVbZVmZcwHjZ5pW92FoFaOf/wjA2Vp7Z/xwu7ssKUBTpQuKLi6RIafy+8eZwJOXTzslzYSjNmpneKmCXlgSSaJVWoI0UIaXS/q55pi7DtJHbKpqNUDfXdp/R7opaBphgY/FKvCRbV5qUk8YGrx1mIi4Tsm1887d2NMFtihuCUVtgVtIYBDeCDGxGSUbBpsX4tDixolx+Lya+/TtLXH4zEdo1hJMBHBZdzQ6fTPRkyl/2YPs7K35pB8luGmeBYPTyL45iAFXhlT2Sx7W3SYagYPngeRe136MbapuufSnEVohAoGBAOrwlSx85S1uYQquRg0Wr9xqmpsN8yW1cv9hRfJWIlaJ18BUGFtjptTXut5QozENTnMN/fLfXw+FbcMUKc8A7Vo5AzdfEdMpaDrPyYJwOzffd7BoMeOD4ieWx9QHvJv+CR+RqONDIxCdYoqnwXXEdBfD9kOVQcyG1Tw9vjl9zTkFAoGBANtbi2P5iptSjCoHKJZutVckbk8zHMX/zAKg1pHwbCpzEirNf6bCEaRJSXwibui4mP7lMCTmhX4YfiaANXJMhq2TnerDsmMiHzhHmapkc4p3Zyrbkux2XLAm3qsV5T+1edDLG2xVI+XUzcJ20aEskzyGwROhdp5EuGf9DHYrdBjpAoGBAMc8GLUugUdiuKbPHZbR63cXbF8bmFwdIRWTTzbwdpQ+txlh93ng60TKYa1QYuQhLasCbZ4+cSX/eBKcEcx7M810VdbqJ3qUPdDKD1AvjviV6LFP2ybe27XI91NG8Fq1NtVvt/JqJ91aKov9MWGGpRDWXQv5EmC44zIABkZI+fVlAoGAQDa3Qmf9lGSA1ZjM3+S+vyjSBetPhALSxP4ycfxwnaib693GfZmYMoClu2oVD5liaFPNWTAGahhfbYPgoXoXft6UvvHU2cJWY1JKgJ/xVtqHX/txMjmf/o0SaAD74D+Oznl2qKrv3EsEhOXljgoPfAtyn/2HTOOPHBnuuPUVgmkCgYB9FGPElKHGeRxrQLePwmhul0/+vJPQLQX6umv3ZdALRFqXXZ0pIFjmQQowgQLGUOSzd91ba7KVWfcwlAIBsTlGs4Eh0g+vphYe/+fPwozs5xXTGGy7uZJOMhP/53ClknSC35+K23LsnB9RzNb/OU5W2gY+LMJw9pFum/cVg5a1eA==-----END RSA PRIVATE KEY-----"
    , publicKey: "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQAB-----END PUBLIC KEY-----"
}