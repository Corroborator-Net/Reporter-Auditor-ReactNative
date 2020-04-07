import {Log} from "./Data";

// TODO: when we move off of Atra we'll have one class implement both this interface and the identity interface
export interface BlockchainInterface{
    getRecordsFor(logBookAddress:string, ignoringLogs:Log[]|null) : Promise<Log[]>;
    formTransaction(data:Log):string
    publishTransaction(txn:string):Promise<string>
    getNewLogbook():Promise<string>
}