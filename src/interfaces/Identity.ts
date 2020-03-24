
/*
*  DID/Signing module:
    1. optional: log who are your trusted peers - accepting from, pushing to. Quasi credential layer - e.g. "I trust this person"
*
*/

export interface Identity{
    Initialize():void,
    PublicPGPKey:string
    PrivatePGPKey:string
    TrustedPeerPGPKeys:string[]
    LoggedIn():Promise<boolean>
    GenerateAndSavePGPKeys():Promise<boolean>
    Encrypt(keys:string[],message:string):string
    Decrypt(key:string, message:string):string
    // sign(base64Data:string):string
    // addTrustedPeerAttestation(did:string):string;
    // getMyAddress():string,
}

