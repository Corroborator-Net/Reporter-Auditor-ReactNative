/*
* 5. corroborator peers module:
        1. hash receipt and/or file receipt
        2. corroborator opt-in supply:
            3. mesh
            4. chat
* */

export class ConnectedCorroborator{
    requestSignature(hash:string){

    }
}

export class Mesh implements PeerCorroborators{
    addConnection(corroborator: ConnectedCorroborator): boolean {
        return false;
    }

    getConnections(): ConnectedCorroborator[] {
        return [];
    }

}
export interface PeerCorroborators{
    getConnections():ConnectedCorroborator[];
    addConnection(corroborator:ConnectedCorroborator):boolean;
}