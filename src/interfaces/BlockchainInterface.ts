import {Log} from "./Data";

export interface BlockchainInterface{
    formTransaction(data:Log):string
    publishTransaction(txn:string):Promise<string>
}