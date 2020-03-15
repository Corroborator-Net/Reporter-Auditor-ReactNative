import {LogbookDatabase} from "../interfaces/Storage";
import {Identity} from "../interfaces/Identity";
import { PeerCorroborators} from "../interfaces/PeerCorroborators";
import HashManager from "./HashManager";
import {HashData, HashReceiver, Log, LogbookStateKeeper, LogMetadata} from "../interfaces/Data";
import RNFetchBlob from "rn-fetch-blob";
import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import NetInfo, {NetInfoState} from "@react-native-community/netinfo";
import {NetInfoStateType} from "@react-native-community/netinfo/src/internal/types";
import SingleLogbookView from "../views/SingleLogbookView";
import { waitMS} from "../utils/Constants";
import _ from "lodash";

// TODO: make singleton
export class LogManager implements HashReceiver{

    logsToSync:Log[] = [];
    syncingLogs=false;
    currentlyConnectedToNetwork = false;
    public static Instance:LogManager;
    constructor(public logStorage:LogbookDatabase,
                public didModule:Identity,
                public peers:PeerCorroborators,
                public hashManager:HashManager,
                public blockchainManager:BlockchainInterface,
                public logbookStateKeeper:LogbookStateKeeper,
                ) {
        if (LogManager.Instance){
            console.log("ERROR: multiple instances of log manager created")
        }
        LogManager.Instance= this;
        hashManager.hashReceivers.push(this);
        NetInfo.addEventListener(state => {this.onNetworkConnectionChange(state)});
        this.checkForUnsyncedLogs();
    }


    public async UploadEditedLogs(logHashes:string[]){

        //TODO: when the user edits a log's metadata, the logcells creates a new log referencing the originalTransactionHash
        // now here we'll go and set the database (general user preferences?) to include all of those logs in an update queue
        // then we'll check for unsynced logs
        const editedLogsToUpload = await this.logStorage.getUnsyncedEditedRecords();
        this.syncLogs(editedLogsToUpload);

    }


    // TODO how can we make this deterministic?
    public async OnDataProduced(hashData:HashData) : Promise<void> {
        await waitMS(100);
        // console.log("Waited before reading to produce hash");

        RNFetchBlob.fs.readFile(hashData.storageLocation, 'base64')
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

        // TODO: show user alert if no logbook selected!!
        const newLog = new Log(
            this.logbookStateKeeper.CurrentLogbook,
            hashData.storageLocation,
            "",
            "",
            hashData.multiHash,
            logMetadata.JsonData()
        );
        // console.log("new log to log: ", newLog);
        // log the data after if/we get signatures
        this.logStorage.addNewRecord(newLog);

        if (this.currentlyConnectedToNetwork ){
            this.uploadToBlockchain(newLog);
        }
    }


    async startBackgroundUploadManager(connected:boolean, wasConnected:boolean){
        if (!wasConnected && connected){
            this.checkForUnsyncedLogs();
        }
    }


    async syncLogs(logs:Log[]){
        for (const log of logs){
            if (!_.includes(this.logsToSync, log)){
                this.logsToSync.push(log);
            }
        }
        if (this.syncingLogs){
            return;
        }
        this.syncingLogs = true;

        while(this.logsToSync.length>0){
            const log  = this.logsToSync.pop();
            const trueLog = Object.setPrototypeOf(log, Log.prototype);
            const logToUpdate = {...trueLog};
            console.log("syncing log: ", logToUpdate);
            await this.uploadToBlockchain(logToUpdate);
        }

        SingleLogbookView.ShouldUpdateLogbookView = true;

        this.syncingLogs = false;

    }

    async checkForUnsyncedLogs(){
        // TODO: the returned logs have their string arrays set to indexed objects. Weird!
        const unsyncedLogs = await this.logStorage.getUnsyncedRecords();
        this.syncLogs(unsyncedLogs);

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
                if (log.originalTransactionHash==""){
                    log.originalTransactionHash = recordID;
                }
                log.currentTransactionHash = recordID;
                this.logStorage.updateLogWithTransactionHash(log);

            }).catch((err)=>{
            console.log("error on submit to blockchain:", err);
            return null;
        })
    }
}

//
// export function hasLocalStorage(arg: any): arg is LocalLogbookDatabase {
//     return arg && arg.type && typeof(arg.type) == 'string';
// }