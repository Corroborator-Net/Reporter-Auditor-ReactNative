import {ImageDatabase} from "../interfaces/Storage";
import {Identity} from "../interfaces/Identity";
// import { PeerCorroborators} from "../interfaces/PeerCorroborators";
// import HashManager from "./HashManager";
import {HashData, Log, LogbookEntry} from "../interfaces/Data";
import {BlockchainInterface} from "../interfaces/BlockchainInterface";
// import NetInfo, {NetInfoState} from "@react-native-community/netinfo";
// import {NetInfoStateType} from "@react-native-community/netinfo/src/internal/types";
import SingleLogbookView from "../views/SingleLogbookView";
import _ from "lodash";
import {LogMetadata} from "./LogMetadata";
import LogbookStateKeeper from "./LogbookStateKeeper";
import {TestHQPEMKey} from "./Constants";


export class LogManager{

    static CurrentlyConnectedToNetwork = true;
    logsToSync:Log[] = [];
    syncingLogs=false;
    public static Instance:LogManager;
    constructor(
                public didModule:Identity,
                public blockchainManager:BlockchainInterface,
                public logbookStateKeeper:LogbookStateKeeper,
                public imageDatabase:ImageDatabase,
                ) {
        if (LogManager.Instance){
            return LogManager.Instance;
        }
        LogManager.Instance= this;
        // NetInfo.addEventListener(state => {this.onNetworkConnectionChange(state)});
        // this.checkForUnsyncedLogs();
        return this
    }




    public async SyncEditedLogs(logbookEntries:LogbookEntry[]): Promise<boolean>{
        console.log("uploading edited logs:", logbookEntries.length);

        let editedLogsToUpload = new Array<Log>();
        for (const entry of logbookEntries){
            const record = entry.HeadImageRecord;
            const oldLog = entry.HeadLog;
            if (record.currentMultiHash == oldLog.currentDataMultiHash && oldLog.currentTransactionHash!= ""){
                console.log("skipping log upload as hash hasn't changed and the log has a transaction hash");
                continue;
            }

            // TODO: make this forloop a method on a logbook entry - get nonroot and nonhead image records
            // delete old image records and images in the camera roll if they exist
            const nonRootNorHeadRecords = entry.getAndRemoveNonRootAndNonHeadRecords();
            for (const oldRecord of nonRootNorHeadRecords){
                // we have multiple image records. let's remove the current head then
                await this.imageDatabase.removeImageRecord(oldRecord);
            }

            await this.imageDatabase.addRecordToModifiedAlbumAndUpdateLocation(record);

            const logMetadata = new LogMetadata(
                record.metadataJSON,
                this.didModule,
                record.currentMultiHash,
                null,
                null,
            );

            // TODO: allow user to change logbook via exif metadata
            const newLog = new Log(
                oldLog.logBookAddress,
                record.storageLocation,
                oldLog.rootTransactionHash,
                "",
                oldLog.rootDataMultiHash,
                record.currentMultiHash,
                logMetadata.JsonData(),
                this.didModule.PublicPGPKey,
                (new Date().getTime() / 1000)
                );
            editedLogsToUpload.push(newLog);
        }

        this.syncLogs(editedLogsToUpload);
        return this.syncingLogs;
    }




    OnNewHashProduced(hashData: HashData, targetLogbookAddress:string, saveToDisk:boolean): void {


        const logMetadata = new LogMetadata(
            hashData.metadataJSON,
            this.didModule,
            hashData.currentMultiHash,
            null,
            null,
        );

        // Hack for corroborating logs on mobile for the demo
        let loggingKey = this.didModule.PublicPGPKey;
        if (!saveToDisk){
           loggingKey = TestHQPEMKey.publicKey
        }

        // TODO: show user alert if no logbook selected!!
        const newLog = new Log(
            targetLogbookAddress,
            hashData.storageLocation,
            "",
            "",
            hashData.currentMultiHash,
            hashData.currentMultiHash,
            logMetadata.JsonData(),
            loggingKey,
            (new Date().getTime() / 1000)

        );



        if (LogManager.CurrentlyConnectedToNetwork){
            this.uploadToBlockchain(newLog, saveToDisk);
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
            await this.uploadToBlockchain(logToUpdate, true);
        }

        console.log("should update!");
        SingleLogbookView.ShouldUpdateLogbookView = true;

        this.syncingLogs = false;
    }

    async checkForUnsyncedLogs(){
        // const unsyncedLogs = await this.logStorage.getUnsyncedRecords();
        // if (unsyncedLogs.length>0) {
        //     this.syncLogs(unsyncedLogs);
        // }

    }


    // onNetworkConnectionChange(state:NetInfoState){
    //     console.log("Connection type", state.type);
    //     if (state.type === NetInfoStateType.cellular){
    //         return;
    //     }
    //     console.log("Is connected?", state.isConnected);
    //     this.startBackgroundUploadManager(state.isConnected, LogManager.CurrentlyConnectedToNetwork);
    //     LogManager.CurrentlyConnectedToNetwork = state.isConnected;
    // }


    async uploadToBlockchain(log:Log, onDisk:boolean){

        if (!LogManager.CurrentlyConnectedToNetwork){
            return ;
        }
        const txn = this.blockchainManager.formTransaction(log);
        this.blockchainManager.publishTransaction(txn).then(
            (recordID)=>{
                console.log("TODO: use record id to get transaction hash? keeping as record id for now: ", recordID);
                // console.log("updating log: ",  JSON.stringify(log, null, 2));
                if (log.rootTransactionHash==""){
                    log.rootTransactionHash = recordID;
                }
                log.currentTransactionHash = recordID;
                // if (onDisk){
                //     this.logStorage.updateLogWithTransactionHash(log);
                // }

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
