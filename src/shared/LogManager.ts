import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {Identity} from "../interfaces/Identity";
import { PeerCorroborators} from "../interfaces/PeerCorroborators";
import HashManager from "./HashManager";
import {HashData, HashReceiver, Log, LogbookEntry, LogbookStateKeeper, LogMetadata} from "../interfaces/Data";
import RNFetchBlob from "rn-fetch-blob";
import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import NetInfo, {NetInfoState} from "@react-native-community/netinfo";
import {NetInfoStateType} from "@react-native-community/netinfo/src/internal/types";
import SingleLogbookView from "../views/SingleLogbookView";
import { waitMS} from "../utils/Constants";
import _ from "lodash";
import CameraRoll from "@react-native-community/cameraroll";


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
                public imageDatabase:ImageDatabase,
                ) {
        if (LogManager.Instance){
            console.log("ERROR: multiple instances of log manager created");
            return LogManager.Instance;
        }
        LogManager.Instance= this;
        hashManager.hashReceivers.push(this);
        NetInfo.addEventListener(state => {this.onNetworkConnectionChange(state)});
        this.checkForUnsyncedLogs();
    }


    public async SyncEditedOrNewLogs(logbookEntries:LogbookEntry[]): Promise<boolean>{
        console.log("uploading edited logs:", logbookEntries.length);

        let editedLogsToUpload = new Array<Log>();
        for (const entry of logbookEntries){
            const record = entry.ImageRecord;
            const oldLog = entry.Log;
            if (record.currentMultiHash == oldLog.dataMultiHash && oldLog.currentTransactionHash!= ""){
                console.log("skipping log upload as hash hasn't changed and the log has a transaction hash");
                continue;
            }

            // delete old image records and images in the camera roll if they exist
            for (const oldRecord of entry.imageRecords){
                // we have multiple image records. let's remove the current head then
                if (oldRecord.currentMultiHash != entry.RootImageRecord.currentMultiHash &&
                    oldRecord.currentMultiHash != record.currentMultiHash){
                    await this.imageDatabase.removeImageRecord(oldRecord);
                }
            }
            await this.imageDatabase.updateImageRecordToHead(record);

            const logMetadata = new LogMetadata(
                record.metadata,
                "ba23e2b0f59d77d72367d2ab4c33fa339c6ec02e536d4a6fd4e866f94cdc14be"
            );
            const newLog = new Log(
                oldLog.logBookAddress,
                record.storageLocation,
                oldLog.rootTransactionHash,
                "",
                record.currentMultiHash,
                logMetadata.JsonData()
                );
            editedLogsToUpload.push(newLog);
        }

        this.syncLogs(editedLogsToUpload);
        return this.syncingLogs;
    }




    OnHashProduced(hashData: HashData): void {

        // console.log("hash: ", hashData.currentMultiHash);
        // return;
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
            this.logbookStateKeeper.CurrentLogbookID,
            hashData.storageLocation,
            "",
            "",
            hashData.currentMultiHash,
            logMetadata.JsonData()
        );
        // console.log("new log to log: ", newLog);
        // log the data after if/we get signatures
        this.logStorage.addNewRecord(newLog).then(()=> {
                SingleLogbookView.ShouldUpdateLogbookView = true
            }
        );

        if (this.currentlyConnectedToNetwork){
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

        console.log("should update!");
        SingleLogbookView.ShouldUpdateLogbookView = true;

        this.syncingLogs = false;
    }

    async checkForUnsyncedLogs(){
        const unsyncedLogs = await this.logStorage.getUnsyncedRecords();
        if (unsyncedLogs.length>0) {
            this.syncLogs(unsyncedLogs);
        }

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
                if (log.rootTransactionHash==""){
                    log.rootTransactionHash = recordID;
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