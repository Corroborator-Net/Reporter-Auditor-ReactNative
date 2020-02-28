import {LogbookDatabase} from "./interfaces/Storage";
import {Identity} from "./interfaces/Identity";
import { PeerCorroborators} from "./interfaces/PeerCorroborators";
import HashManager from "./HashManager";
import {HashData, HashReceiver, Log} from "./interfaces/Data";
import RNFetchBlob from "rn-fetch-blob";
    //@ts-ignore
    const delay = ms => new Promise(res => setTimeout(res, ms));

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


    // TODO how can we make this deterministic?
    public async OnDataProduced(dataToHash:HashData, base64Data:string) : Promise<void> {
        await delay(100);
        console.log("Waited");

        const fileName = dataToHash.location.slice(dataToHash.location.lastIndexOf("/") + 1,dataToHash.location.length);
        const fullPath = "file:///storage/emulated/0/Pictures/" + fileName;

        RNFetchBlob.fs.readFile(fullPath, 'base64')
            .then((data) => {
                // https://emn178.github.io/online-tools/sha256_checksum.html produces matching hex hashes
                console.log("log manager reading file at: " + fullPath);
                this.hashManager.GetHash(dataToHash,data);
            })
    }


    OnHashProduced(hashData: HashData): void {
        // TODO get signature from our did module
        // this.didModule.sign(hashData.multiHash);

        // TODO get signatures from our peers
        // const peers = this.peers.getConnections();
        // for (const peer of peers){
        //     peer.requestSignature(hashData.multiHash);
        // }
        console.log("storing log with hash: " + hashData.multiHash);
        const newLog = new Log(
            LogManager.CurrentLogBookAddress,
            LogManager.CurrentAddress,
            hashData.location,
            hashData.multiHash,
            [""],
            [""]
        );
        // log the data after if/we get signatures
        this.logStorage.addNewRecord(newLog);
    }



}