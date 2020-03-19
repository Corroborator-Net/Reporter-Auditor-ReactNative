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


    public async UploadEditedLogs(logbookEntries:LogbookEntry[]){
        console.log("uploading edited logs:", logbookEntries.length);

        let editedLogsToUpload = new Array<Log>();
        for (const entry of logbookEntries){
            // add logs here to record
            const record = entry.ImageRecord;
            const oldLog = entry.Log;
            console.log("edited record current hash:", record.currentMultiHash);
            console.log("edited record root hash:", record.rootMultiHash);
            await this.SaveToCameraRoll(record);
            // const oldLog = logs.filter(matchingLog=>{return matchingLog.dataMultiHash === record.rootMultiHash;})[0];
            const newLog = new Log(
                oldLog.logBookAddress,
                record.storageLocation,
                oldLog.rootTransactionHash,
                "",
                record.currentMultiHash,
                record.metadata
                );
            editedLogsToUpload.push(newLog);
        }

        this.syncLogs(editedLogsToUpload);
    }


    // TODO: how to implement?
    public async SaveToCameraRoll(hashableData:HashData) {

        console.log(hashableData.storageLocation);
        // saving to the cache and then the camera roll is the platform agnostic way to do it as fs.CameraDir and
        // fs.DCIMDir are android only, and in addition the saved images don't show up in the camera roll
        RNFetchBlob.fs.createFile(
            hashableData.storageLocation.slice("file://".length),
            hashableData.base64Data,
            "base64").then(async ()=>{
            // await waitMS(10);
            await CameraRoll.saveToCameraRoll(hashableData.storageLocation, "photo");
        })

    }

    // TODO how can we make this deterministic?
    public async LoadFileToGetBase64AndHash(hashData:HashData):Promise<string[]> {

        await waitMS(20);
        // console.log("Waited before reading to produce hash");
        // this.hashManager.GetHash(hashData,hashData.base64Data);

       return RNFetchBlob.fs.readFile(hashData.storageLocation, 'base64')
            .then((data) => {
                // https://emn178.github.io/online-tools/sha256_checksum.html produces matching hex hashes
                // console.log("log manager reading file: ", data.slice(0,50));

                // TODO: check if the data starts with `data:image/jpeg;base64,${base64Data}` and remove it if so?
                return [data, HashManager.GetHashSync(data)];
            })
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
            this.logbookStateKeeper.CurrentLogbook,
            hashData.storageLocation,
            "",
            "",
            hashData.currentMultiHash,
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