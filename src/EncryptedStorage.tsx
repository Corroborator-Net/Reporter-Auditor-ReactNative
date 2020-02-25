import Realm from 'realm';
import {ImageDatabase, LogbookDatabase } from "./interfaces/Storage";
import {ImageRecord, ImageRecordSchema, Log, LogSchema} from "./interfaces/Data";

const schemaVersion = 2;
// TODO: add encryption
export default class EncryptedStorage implements ImageDatabase, LogbookDatabase{


    public async add(picture:ImageRecord): Promise<string>{
        const schemaName = 'LogSchema';
        return Realm.open({schema: [ImageRecordSchema], schemaVersion: schemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newHash = realm.create(schemaName,
                        picture
                    );
                    console.log(newHash.multiHash);
                });

                // Query Realm for all unsynced image hashes
                const imageHashes = realm.objects(schemaName).filtered('transactionHash != null');

                console.log(imageHashes.length);
                return  ""; // no error
            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }

    addNewRecord(newRecord: Log): Promise<string> {
        const schemaName = 'LogSchema';
        return Realm.open({schema: [LogSchema], schemaVersion: schemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newLog = realm.create(schemaName,
                        newRecord
                    );
                    console.log(newLog.dataMultiHash);
                });

                // Query Realm for all unsynced image hashes
                const logs = realm.objects(schemaName).filtered('dataMultiHash != null');

                console.log(logs.length);
                return  ""; // no error
            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }

    getRecordsFor(logBookAddress: string): Promise<Log[]> {
        const schemaName = 'LogSchema';
        return Realm.open({schema: [LogSchema], schemaVersion: schemaVersion})
            .then(realm => {
                // Query Realm for all unsynced image hashes
                const logs = realm.objects(schemaName).filtered('logBookAddress != null'); //  + logBookAddress
                console.log(logs.length);
                return  logs; // no error
            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });

    }

}
