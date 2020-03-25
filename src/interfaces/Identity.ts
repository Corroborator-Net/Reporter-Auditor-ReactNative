
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
    CorroborateData(base64Data:string):Promise<string>;
    // sign(base64Data:string):string
    // addTrustedPeerAttestation(did:string):string;
    // getMyAddress():string,
}

