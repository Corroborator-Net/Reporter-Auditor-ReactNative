/*
* 7. Trusted/trust peers module
        1. which users you will accept validation requests from
        2. need a request trust peer method
* */

export interface Trust {
    isTrusted(peerAddress:string) : boolean;
    getAllTrustedPeers():string[];
    trust(peerAddress:string):null;
}