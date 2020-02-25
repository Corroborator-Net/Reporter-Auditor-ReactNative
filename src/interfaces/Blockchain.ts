export interface Blockchain{
    formTransaction(data:string):string
    publishTransaction(txn:string):string
}