import Realm from 'realm';
import {LogbookDatabase} from "../interfaces/Storage";
import {Log, LogSchema, RealmSchemas} from "../interfaces/Data";
import { StorageSchemaVersion} from "../utils/Constants"

// TODO: encrypt each record
export default class NativeEncryptedLogbookStorage implements LogbookDatabase{
    public type = "local";

    // TODO: limit the arguments to the transaction hash and the multihash
    updateLogWithTransactionHash(log: Log): void {
        Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    realm.create(
                        LogSchema.name,
                        log,
                        Realm.UpdateMode.Modified
                    );
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }


    getUnsyncedRecords(): Promise<Log[]> {
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Query Realm for all unsynced image hashes
                return realm.objects(LogSchema.name).
                filtered('currentTransactionHash = ""');
            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }


    addNewRecord(newRecord: Log): Promise<string> {
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {

                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newLog = realm.create(
                        LogSchema.name,
                        newRecord
                    );

                });

                return  ""; // no error
            })
            .catch((error) => {
                console.log("add record error: " + error);
                return error // read error
            });
    }


    getRecordsFor(logBookAddress: string): Promise<Log[]> {
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Query Realm for all unsynced image hashes
                const logs = realm.objects(LogSchema.name).
                filtered("logBookAddress = '"+ logBookAddress +"'");
                          //+ " SORT(name DESC)");

                // reverse the order of the logs to get most recent first
                let reverseLogs = new Array<Log>();
                for (const log of logs){
                    //@ts-ignore
                    reverseLogs.unshift(log);
                }
                return reverseLogs; // no error
            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }


    // // TODO: We need to figure out how to sort logs in order by time taken. when we get the DID signing working
    // // TODO: the signed metadata will be a json, so parsing must be taken into account.
    // getMostRecentRecord(logBookAddress: string): Promise<Log> {
    //     return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
    //         .then(realm => {
    //             // Query Realm for all unsynced image hashes
    //             const logs = realm.objects(NativeEncryptedLogbookStorage.schemaName).
    //             filtered("logBookAddress = '" + logBookAddress + "'" );
    //             //+ " SORT(name DESC)");
    //
    //             return logs[logs.length-1];
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //             return error
    //         });
    // }

}
