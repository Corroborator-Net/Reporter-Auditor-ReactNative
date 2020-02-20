import Realm from 'realm';

export class ImageHash  {
    constructor( public timestamp:Date, public location:string, public multiHash:string, public transactionHash:string|null) {
    }
}

const ImageHashSchema = {
    name: 'ImageHash',
    properties: {
        timestamp:  'date',
        location: 'string',
        multiHash: 'string',
        transactionHash: 'string?',
        // multihash: {type: 'int', default: 0},
    }
};
export default class EncryptedStorage{

    static Save(newImageHash:ImageHash){
        Realm.open({schema: [ImageHashSchema], schemaVersion: 1})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newHash = realm.create('ImageHash',
                        newImageHash
                    );
                    console.log(newHash.multiHash);
                });

                // Query Realm for all unsynced image hashes
                const imageHashes = realm.objects('ImageHash').filtered('transactionHash != null');

                console.log(imageHashes.length);
                // // Remember to close the realm when finished.
                // if (!realm.isClosed) {
                //     realm.close();
                // }
            })
            .catch((error) => {
                console.log(error);
            });
    }

}
