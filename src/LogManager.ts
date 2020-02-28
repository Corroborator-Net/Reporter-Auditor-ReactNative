import {LocalLogbookDatabase, LogbookDatabase} from "./interfaces/Storage";
import {Identity} from "./interfaces/Identity";
import { PeerCorroborators} from "./interfaces/PeerCorroborators";
import HashManager from "./HashManager";
import {HashData, HashReceiver, Log} from "./interfaces/Data";
import RNFetchBlob from "rn-fetch-blob";
import {BlockchainInterface} from "./interfaces/BlockchainInterface";
import {NativeAtraManager} from "./NativeAtraManager";

//@ts-ignore
const delay = ms => new Promise(res => setTimeout(res, ms));

export class LogManager implements HashReceiver{

    static CurrentLogBookAddress = NativeAtraManager.firstTableId;
    static CurrentAddress = "";

    constructor(public logStorage:LogbookDatabase,
                public didModule:Identity,
                public peers:PeerCorroborators,
                public hashManager:HashManager,
                public blockchainManager:BlockchainInterface,
                ) {
        hashManager.hashReceivers.push(this);
        LogManager.CurrentAddress = didModule.getMyAddress();
        this.startBackgroundUploadManager();
    }


    // TODO how can we make this deterministic?
    public async OnDataProduced(hashData:HashData) : Promise<void> {
        await delay(100);
        console.log("Waited before reading to produce hash");

        // TODO make full path depend on OS
        const fileName = hashData.storageLocation.slice(hashData.storageLocation.lastIndexOf("/") + 1,hashData.storageLocation.length);
        const fullPath = "file:///storage/emulated/0/Pictures/" + fileName;

        RNFetchBlob.fs.readFile(fullPath, 'base64')
            .then((data) => {
                // https://emn178.github.io/online-tools/sha256_checksum.html produces matching hex hashes
                // console.log("log manager reading file at: " + fullPath);
                this.hashManager.GetHash(hashData,data);
            })
    }


    OnHashProduced(hashData: HashData): void {
        // TODO get signature from our did module
        // const signedHash = this.didModule.sign(hashData.multiHash);
        // const signedMetaData = this.didModule.sign(hashData.timeStamp);

        // TODO get signatures from our peers
        // const peers = this.peers.getConnections();
        // for (const peer of peers){
        //     peer.requestSignature(hashData.multiHash);
        // }

        console.log("storing log with hash: " + hashData.multiHash);
        const newLog = new Log(
            LogManager.CurrentLogBookAddress,
            LogManager.CurrentAddress,
            hashData.storageLocation,
            "",
            hashData.multiHash,
            [""],
            [""]
        );
        // log the data after if/we get signatures
        this.logStorage.addNewRecord(newLog);
        this.backgroundUploadToBlockchain(newLog);
    }

    // TODO execute every x seconds in background, find logs without transaction hashes
    async startBackgroundUploadManager(){
        if (isLocal(this.logStorage)) {
            // TODO check if we're online
            while (true) {
                await delay(5000);
                const unsyncedLogs = await this.logStorage.getUnsyncedRecords();
                console.log("unsynced logs is of length: " + unsyncedLogs.length);
            }
        }
    }


    async backgroundUploadToBlockchain(log:Log){
        // TODO check if we're online
        const txn = this.blockchainManager.formTransaction(log);
        const recordID = await this.blockchainManager.publishTransaction(txn);
        console.log("got blockchain transaction hash/ record ID for atra: " + recordID);
        console.log("TODO: use record id to get transaction hash? keeping as record id for now.");
        if (isLocal(this.logStorage)){
            log.transactionHash = recordID;
            this.logStorage.updateRecord(log);
        }
    }
}

function isLocal(arg: any): arg is LocalLogbookDatabase {
    return arg && arg.type && typeof(arg.type) == 'string';
}