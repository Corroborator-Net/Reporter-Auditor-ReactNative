import {LogbookDatabase} from "./interfaces/Storage";
import {Identity} from "./interfaces/Identity";
import { PeerCorroborators} from "./interfaces/PeerCorroborators";
import HashManager from "./HashManager";
import {HashData, HashReceiver, Log} from "./interfaces/Data";

export class LogManager implements HashReceiver{

    static CurrentLogBookAddress = "0";
    static CurrentAddress = "";

    constructor(public logStorage:LogbookDatabase,
                public didModule:Identity,
                public peers:PeerCorroborators,
                public hashManager:HashManager,
                ) {
        hashManager.hashReceivers.push(this);
        LogManager.CurrentAddress = didModule.getMyAddress();
    }


    OnHashProduced(hashData: HashData): void {
        // TODO get signature from our did module
        // this.didModule.sign(hashData.multiHash);

        // TODO get signatures from our peers
        // const peers = this.peers.getConnections();
        // for (const peer of peers){
        //     peer.requestSignature(hashData.multiHash);
        // }
        console.log(hashData.multiHash);
        const newLog = new Log(LogManager.CurrentLogBookAddress,
            LogManager.CurrentAddress,
            hashData.multiHash,
            [""],
            [""]
        );
        // log the data after if/we get signatures
        this.logStorage.addNewRecord(newLog);
        // console.log("log this hash data!")
    }



}