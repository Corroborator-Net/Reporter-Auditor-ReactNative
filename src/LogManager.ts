import {LogbookDatabase} from "./interfaces/Storage";
import {Identity} from "./interfaces/Identity";
import {ConnectedCorroborator, PeerCorroborators} from "./interfaces/PeerCorroborators";
import HashManager from "./HashManager";
import {HashData, HashReceiver, Log} from "./interfaces/Data";

export class LogManager implements HashReceiver{
    constructor(public logStorage:LogbookDatabase,
                public didModule:Identity,
                public peers:PeerCorroborators,
                public hashManager:HashManager,
                ) {

        hashManager.hashReceivers.push(this)
    }

    OnHashProduced(hashData: HashData): void {
        // get signature from our did module
        this.didModule.sign(hashData.multiHash);

        // get signatures from our peers
        const peers = this.peers.getConnections();
        for (const peer of peers){
            peer.requestSignature(hashData.multiHash);
        }
        console.log(hashData.multiHash);
        const newLog = new Log("666",hashData.multiHash,["test"], ["test"]);
        // log the data after if/we get signatures
        this.logStorage.addNewRecord(newLog);
        console.log("log this hash data!")
    }



}