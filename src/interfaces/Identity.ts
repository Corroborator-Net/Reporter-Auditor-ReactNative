
/*
*  DID/Signing module:
    1. optional: log who are your trusted peers - accepting from, pushing to. Quasi credential layer - e.g. "I trust this person"
*
*/

export interface Identity{
    Initialize():void,
    sign(base64Data:string):string
    addTrustedPeerAttestation(did:string):string;
    getMyAddress():string,
}

