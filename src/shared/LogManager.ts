import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {Identity} from "../interfaces/Identity";
import { PeerCorroborators} from "../interfaces/PeerCorroborators";
import HashManager from "./HashManager";
import {HashData, Log, LogbookEntry} from "../interfaces/Data";
import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import NetInfo, {NetInfoState} from "@react-native-community/netinfo";
import {NetInfoStateType} from "@react-native-community/netinfo/src/internal/types";
import SingleLogbookView from "../views/SingleLogbookView";
import _ from "lodash";
import {LogMetadata} from "./LogMetadata";
import LogbookStateKeeper from "./LogbookStateKeeper";


export class LogManager{

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
            return LogManager.Instance;
        }
        LogManager.Instance= this;
        NetInfo.addEventListener(state => {this.onNetworkConnectionChange(state)});
        this.checkForUnsyncedLogs();
    }


    public async SyncEditedLogs(logbookEntries:LogbookEntry[]): Promise<boolean>{
        console.log("uploading edited logs:", logbookEntries.length);

        let editedLogsToUpload = new Array<Log>();
        for (const entry of logbookEntries){
            const record = entry.ImageRecord;
            const oldLog = entry.Log;
            if (record.currentMultiHash == oldLog.currentDataMultiHash && oldLog.currentTransactionHash!= ""){
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
                null
                );
            editedLogsToUpload.push(newLog);
        }

        this.syncLogs(editedLogsToUpload);
        return this.syncingLogs;
    }




    OnNewHashProduced(hashData: HashData, targetLogbookAddress:string, saveToDisk:boolean): void {


        // TODO get signature from our did module
        // const signedHash = this.didModule.sign(hashData.multiHash);
        // const signedMetaData = this.didModule.sign(hashData.timeStamp);

        // TODO get signatures from our peers
        // const peers = this.peers.getConnections();
        // for (const peer of peers){
        //     peer.requestSignature(hashData.multiHash);
        // }


        const logMetadata = new LogMetadata(
            hashData.metadataJSON,
            this.didModule,
            hashData.currentMultiHash,
            null,
            null,
        );

        // console.log("new json data:", logMetadata.JsonData());

        const TestCorroboratingPEMKey={privateKey: "-----BEGIN RSA PRIVATE KEY----- MIIEpAIBAAKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQABAoIBAQCBw9/TkfcWfzLe5/Eoj9L/rjr5c9a8QpNi3qS91Tk0WOVbZVmZcwHjZ5pW92FoFaOf/wjA2Vp7Z/xwu7ssKUBTpQuKLi6RIafy+8eZwJOXTzslzYSjNmpneKmCXlgSSaJVWoI0UIaXS/q55pi7DtJHbKpqNUDfXdp/R7opaBphgY/FKvCRbV5qUk8YGrx1mIi4Tsm1887d2NMFtihuCUVtgVtIYBDeCDGxGSUbBpsX4tDixolx+Lya+/TtLXH4zEdo1hJMBHBZdzQ6fTPRkyl/2YPs7K35pB8luGmeBYPTyL45iAFXhlT2Sx7W3SYagYPngeRe136MbapuufSnEVohAoGBAOrwlSx85S1uYQquRg0Wr9xqmpsN8yW1cv9hRfJWIlaJ18BUGFtjptTXut5QozENTnMN/fLfXw+FbcMUKc8A7Vo5AzdfEdMpaDrPyYJwOzffd7BoMeOD4ieWx9QHvJv+CR+RqONDIxCdYoqnwXXEdBfD9kOVQcyG1Tw9vjl9zTkFAoGBANtbi2P5iptSjCoHKJZutVckbk8zHMX/zAKg1pHwbCpzEirNf6bCEaRJSXwibui4mP7lMCTmhX4YfiaANXJMhq2TnerDsmMiHzhHmapkc4p3Zyrbkux2XLAm3qsV5T+1edDLG2xVI+XUzcJ20aEskzyGwROhdp5EuGf9DHYrdBjpAoGBAMc8GLUugUdiuKbPHZbR63cXbF8bmFwdIRWTTzbwdpQ+txlh93ng60TKYa1QYuQhLasCbZ4+cSX/eBKcEcx7M810VdbqJ3qUPdDKD1AvjviV6LFP2ybe27XI91NG8Fq1NtVvt/JqJ91aKov9MWGGpRDWXQv5EmC44zIABkZI+fVlAoGAQDa3Qmf9lGSA1ZjM3+S+vyjSBetPhALSxP4ycfxwnaib693GfZmYMoClu2oVD5liaFPNWTAGahhfbYPgoXoXft6UvvHU2cJWY1JKgJ/xVtqHX/txMjmf/o0SaAD74D+Oznl2qKrv3EsEhOXljgoPfAtyn/2HTOOPHBnuuPUVgmkCgYB9FGPElKHGeRxrQLePwmhul0/+vJPQLQX6umv3ZdALRFqXXZ0pIFjmQQowgQLGUOSzd91ba7KVWfcwlAIBsTlGs4Eh0g+vphYe/+fPwozs5xXTGGy7uZJOMhP/53ClknSC35+K23LsnB9RzNb/OU5W2gY+LMJw9pFum/cVg5a1eA==-----END RSA PRIVATE KEY-----"
            , publicKey: "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQAB-----END PUBLIC KEY-----"
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
            this.didModule.PublicPGPKey,
            null
        );

        // log the data after if/we get signatures
        if (saveToDisk) {
            this.logStorage.addNewRecord(newLog).then(() => {
                    SingleLogbookView.ShouldUpdateLogbookView = true
                }
            );
        }

        if (this.currentlyConnectedToNetwork){
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


    async uploadToBlockchain(log:Log, onDisk:boolean){

        if (!this.currentlyConnectedToNetwork){
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
                if (onDisk){
                    this.logStorage.updateLogWithTransactionHash(log);
                }

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