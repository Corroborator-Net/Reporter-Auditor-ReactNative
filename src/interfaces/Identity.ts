
/*
*  DID/Signing module:
    1. optional: log who are your trusted peers - accepting from, pushing to. Quasi credential layer - e.g. "I trust this person"
*
*/

export interface Identity{
    sign(base64Data:string):string
    addTrustedPeerAttestation(did:string):string;
    getMyAddress():string,
}

export default class DID implements Identity{
    addTrustedPeerAttestation(did: string): string {
        return "";
    }

    sign(base64Data: string): string {
        return "";
    }

    getMyAddress(): string {
        return "123456";
    }


}