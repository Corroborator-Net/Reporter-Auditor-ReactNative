import Realm from 'realm';
import {LocalLogbookDatabase, LogbookDatabase} from "./interfaces/Storage";
import {Log, RealmSchemas} from "./interfaces/Data";
import {StorageSchemaVersion} from "./utils/Constants"


// TODO: encrypt each record
export default class NativeEncryptedLogbookStorage implements LogbookDatabase, LocalLogbookDatabase{
    static schemaName = 'LogSchema';

    updateRecord(log: Log): void {
        Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newLog = realm.create(
                        NativeEncryptedLogbookStorage.schemaName,
                        log,
                        Realm.UpdateMode.Modified
                    );
                });
                realm.close();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    public type = "local";
    getUnsyncedRecords(): Promise<Log[]> {
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Query Realm for all unsynced image hashes
                return realm.objects(NativeEncryptedLogbookStorage.schemaName).filtered('transactionHash == ""');
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
                    const newLog = realm.create(NativeEncryptedLogbookStorage.schemaName,
                        newRecord
                    );
                    console.log(newLog.dataMultiHash);
                });

                return  "" && realm.close(); // no error
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
                const logs = realm.objects(NativeEncryptedLogbookStorage.schemaName).filtered("logBookAddress = '"+ logBookAddress +"'");

                return  logs; // no error
            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }

    // TODO decrypt the first element of the metadata to get timestamp/location
    getAllRecords(reporterAddress: string): Promise<Log[]> {
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Query Realm for all unsynced image hashes
                const logs = realm.objects(NativeEncryptedLogbookStorage.schemaName).
                filtered("reporterAddress != null AND reporterAddress = '" + reporterAddress + "'" );
                    //+ " SORT(name DESC)");

                return logs;
            })
            .catch((error) => {
                console.log(error);
                return error
            });
    }

}
