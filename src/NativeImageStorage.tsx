import React from "react";
import CameraRoll, {PhotoIdentifier} from "@react-native-community/cameraroll";
import {ImageDatabase} from "./interfaces/Storage";
import {ImageRecord, RealmSchemas} from "./interfaces/Data";
import Realm from "realm";
import {StorageSchemaVersion} from "./utils/Constants"

// NATIVE IMPLEMENTATION
export default class NativeImageStorage implements ImageDatabase{

    public async add(picture:ImageRecord): Promise<string>{
        const schemaName = 'ImageHash';
        // // close open log realm
        // await Realm.open({schema: [LogSchema], schemaVersion: StorageSchemaVersion})
        //     .then(realm => {
        //             realm.close();
        //     });

        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newHash = realm.create(schemaName,
                        picture
                    );
                    // console.log(newHash.multiHash);
                });
                realm.close();
                return  ""; // no error
            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }


    public async getImages(first: number):Promise<Array<PhotoIdentifier>> {
        return CameraRoll.getPhotos({
            first: first,
            assetType: 'Photos',
        })
            .then(r => {
                // console.log(r.edges[0].node.image.uri);
                return (r.edges)
            })
            .catch((err) => {
                //Error Loading Images
                return(err)
            });
    }



}