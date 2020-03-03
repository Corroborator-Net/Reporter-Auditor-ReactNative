import React from "react";
import CameraRoll, {PhotoIdentifier} from "@react-native-community/cameraroll";
import {ImageDatabase} from "./interfaces/Storage";
import {ImageRecord, Log, RealmSchemas} from "./interfaces/Data";
import Realm from "realm";
import {StorageSchemaVersion} from "./utils/Constants"
const schemaName = 'ImageHash';

// NATIVE IMPLEMENTATION
export default class NativeImageStorage implements ImageDatabase{

    public async add(picture:ImageRecord): Promise<string>{
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newHash = realm.create(schemaName,
                        picture
                    );
                    // console.log(newHash.multiHash);
                });
                return  ""; // no error
            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }


    public async getImages(logs:Log[]):Promise<ImageRecord[]> {
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                let imageRecords = new Array<ImageRecord>();
                for (const log of logs){
                    const imageRecord= realm.objects(schemaName).filtered("storageLocation = '" + log.storageLocation +"'")[0];
                    // const imageRecord= realm.objects(schemaName).filtered("multiHash = '" + log.dataMultiHash +"'")[0];
                    //@ts-ignore
                    imageRecords.push(imageRecord);
                }
                return imageRecords;

            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }



}