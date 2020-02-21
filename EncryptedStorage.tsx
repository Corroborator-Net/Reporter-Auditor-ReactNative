import Realm from 'realm';
import {ImageDatabase, ImageRecord, ImageRecordSchema} from "./Models";


// TODO: add encryption
export default class EncryptedStorage implements ImageDatabase{

    public async add(picture:ImageRecord): Promise<string>{

        return Realm.open({schema: [ImageRecordSchema], schemaVersion: 2})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newHash = realm.create('ImageHash',
                        picture
                    );
                    console.log(newHash.multiHash);
                });

                // Query Realm for all unsynced image hashes
                const imageHashes = realm.objects('ImageHash').filtered('transactionHash != null');

                console.log(imageHashes.length);
                return  ""; // no error
            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }

}
