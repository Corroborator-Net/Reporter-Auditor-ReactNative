import React from "react";
import {ImageDatabase} from "../interfaces/Storage";
import {ImageRecord, ImageRecordSchema, Log, RealmSchemas} from "../interfaces/Data";
import Realm from "realm";
import {StorageSchemaVersion} from "../utils/Constants"

// NATIVE IMPLEMENTATION
export default class NativeImageStorage implements ImageDatabase{

    public async add(picture:ImageRecord): Promise<string>{
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newHash = realm.create(ImageRecordSchema.name,
                        picture
                    );
                    // console.log(newHash.multiHash);
                });
                return  ""; // no error
            })
            .catch((error) => {
                console.log( "error on add image record!",error);
                return error // read error
            });
    }


    public async getImages(logs:Log[]):Promise<string[]> {

        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                let imageRecords = new Array<string>();
                for (const log of logs){
                    const imageRecord = realm.objects(ImageRecordSchema.name).
                    filtered("storageLocation = '" + log.storageLocation +"'")[0];

                    // const imageRecord= realm.objects(schemaName).filtered("multiHash = '" + log.dataMultiHash +"'")[0];
                    if (imageRecord){
                        //@ts-ignore
                        imageRecords.push(imageRecord.base64Data);
                    }

                }
                return imageRecords;

            })
            .catch((error) => {
                console.log( "error on get images!",error);
                return error // read error
            });
    }


    public async getImageRecordsWithMatchingRootHash(hash:string):Promise<ImageRecord[]> {

        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // TODO: order by their time stamp
                const imageRecords = realm.objects(ImageRecordSchema.name).
                filtered("rootMultiHash = '" + hash +"' SORT(timestamp ASC)");

                return imageRecords;

            })
            .catch((error) => {
                console.log( "error on get image record via root hash!",error);
                return error // read error
            });
    }

    public async removeImageRecord(imageRecord: ImageRecord): Promise<string> {
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    console.log("deleting record with key:", imageRecord.currentMultiHash);
                    // const record = realm.create(ImageRecordSchema.name, imageRecord);
                    realm.delete(imageRecord);
                    return "deleted"; // no error
                });
            })
            .catch((error) => {
                console.log( "error on remove image record!",error);
                return error // read error
            });
    }

    public async getUnLoggedEditedImages():Promise<ImageRecord[]> {

        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {

                // TODO: order by their time stamp
                const imageRecords = realm.objects(ImageRecordSchema.name).
                filtered("storageLocation = ''");

                return imageRecords;

            })
            .catch((error) => {
                console.log( "error on get image record via root hash!",error);
                return error // read error
            });
    }


}