import {LocalLogbookDatabase, LogbookDatabase} from "../interfaces/Storage";
import {Identity} from "../interfaces/Identity";
import { PeerCorroborators} from "../interfaces/PeerCorroborators";
import HashManager from "./HashManager";
import {HashData, HashReceiver, Log, LogMetadata} from "../interfaces/Data";
import RNFetchBlob from "rn-fetch-blob";
import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import NetInfo, {NetInfoState} from "@react-native-community/netinfo";
import {NetInfoStateType} from "@react-native-community/netinfo/src/internal/types";
import LogbookView from "../views/LogbookView";
import {AndroidFileStorageLocation, defaultAtraTableId, waitMS} from "../utils/Constants";
import UserPreferences from "../utils/UserPreferences";

// TODO: make singleton
export class LogManager implements HashReceiver{

    // static CurrentAddress = "";
    syncingLogs = false;
    currentlyConnectedToNetwork = false;

    constructor(public logStorage:LogbookDatabase,
                public didModule:Identity,
                public peers:PeerCorroborators,
                public hashManager:HashManager,
                public blockchainManager:BlockchainInterface,
                ) {
        hashManager.hashReceivers.push(this);
        // LogManager.CurrentAddress = didModule.getMyAddress();
        NetInfo.addEventListener(state => {this.onNetworkConnectionChange(state)});
        this.checkForUnsyncedLogs();
    }


    // TODO how can we make this deterministic?
    public async OnDataProduced(hashData:HashData) : Promise<void> {
        await waitMS(100);
        // console.log("Waited before reading to produce hash");
        // TODO: assumption: assumes all metadata includes a LogMetadata.FileName key
        const fileName =  JSON.parse(hashData.metadata)[LogMetadata.FileName];
        const fullPath = AndroidFileStorageLocation +fileName;

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

        const logMetadata = new LogMetadata(
            hashData.metadata,
            "ba23e2b0f59d77d72367d2ab4c33fa339c6ec02e536d4a6fd4e866f94cdc14be"
        );

        const newLog = new Log(
            UserPreferences.GetCurrentLogbook(),
            hashData.storageLocation,
            "",
            hashData.multiHash,
            logMetadata.JsonData()
        );
        // console.log("new log to log: ", newLog);
        // log the data after if/we get signatures
        this.logStorage.addNewRecord(newLog);
        if (this.currentlyConnectedToNetwork){
            this.uploadToBlockchain(newLog);
        }
    }


    async startBackgroundUploadManager(connected:boolean, wasConnected:boolean){
        if (!wasConnected && connected){
            this.checkForUnsyncedLogs();
        }
    }


    async checkForUnsyncedLogs(){
        if (this.syncingLogs){
            return;
        }
        this.syncingLogs = true;
        if (isLocal(this.logStorage)) {
            // TODO: the returned logs have their string arrays set to indexed objects. Weird!
            const unsyncedLogs = await this.logStorage.getUnsyncedRecords();
            console.log("unsynced logs is of length: " + unsyncedLogs.length);
            for (const log of unsyncedLogs){
                const trueLog = Object.setPrototypeOf(log, Log.prototype);
                const logToUpdate = {...trueLog};
                console.log("previously unsynced log to update: ", logToUpdate);
                await this.uploadToBlockchain(logToUpdate);
            }
            console.log("finished syncing");
            LogbookView.ShouldUpdateLogbookView = true;
        }
        this.syncingLogs = false;
    }


    onNetworkConnectionChange(state:NetInfoState){
        console.log("Connection type", state.type);
        if (state.type === NetInfoStateType.cellular){
            return;
        }
        console.log("Is connected?", state.isConnected);
        this.startBackgroundUploadManager(state.isConnected, this.currentlyConnectedToNetwork);
        this.currentlyConnectedToNetwork = state.isConnected;
    }


    async uploadToBlockchain(log:Log){

        if (!this.currentlyConnectedToNetwork){
            return ;
        }
        const txn = this.blockchainManager.formTransaction(log);
        this.blockchainManager.publishTransaction(txn).then(
            (recordID)=>{
                console.log("TODO: use record id to get transaction hash? keeping as record id for now: ", recordID);
                if (isLocal(this.logStorage)){
                    log.transactionHash = recordID;
                    this.logStorage.updateRecord(log);
                }
            }).catch((err)=>{
            console.log("error on submit to blockchain:", err);
            return null;
        })
    }
}

function isLocal(arg: any): arg is LocalLogbookDatabase {
    return arg && arg.type && typeof(arg.type) == 'string';
}