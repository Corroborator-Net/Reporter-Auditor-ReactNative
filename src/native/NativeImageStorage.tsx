import React from "react";
import {ImageDatabase} from "../interfaces/Storage";
import { ImageRecord, ImageRecordSchema, RealmSchemas} from "../interfaces/Data";
import Realm from "realm";
import {GetPathToCameraRoll, ModifiedAlbum, StorageSchemaVersion} from "../shared/Constants"
import RNFetchBlob from "rn-fetch-blob";
import CameraRoll from "@react-native-community/cameraroll";

// NATIVE IMPLEMENTATION
export default class NativeImageStorage implements ImageDatabase{


    public async updateImageRecordToHead(imageRecord:ImageRecord): Promise<string> {
        // saving to the cache and then the camera roll is the platform agnostic way to do it as fs.CameraDir and
        // fs.DCIMDir are android only, and in addition the saved images don't show up in the camera roll
        await RNFetchBlob.fs.createFile(
            imageRecord.storageLocation.slice("file://".length),
            imageRecord.base64Data,
            "base64").catch(()=>{
                console.log(`already a file at ${imageRecord.storageLocation} , carrying on`)
        });

        await CameraRoll.save(imageRecord.storageLocation, {type:'photo',album:ModifiedAlbum}).catch(()=>{
            console.log(`already a file at ${imageRecord.storageLocation} in camera roll , carrying on`)
        });


        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    imageRecord.storageLocation = GetPathToCameraRoll(imageRecord.filename, false);

                    realm.create(
                        ImageRecordSchema.name,
                        imageRecord,
                        Realm.UpdateMode.Modified
                    );
                    return  ""; // no error
                });

            })
            .catch((error) => {
                console.log("error on update image record:", error);
                return error
            });
    }



    public async add(picture:ImageRecord): Promise<string>{
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    realm.create(ImageRecordSchema.name,
                        picture
                    );
                    // console.log(newHash.multiHash);
                    return  ""; // no error
                });
            })
            .catch((error) => {
                console.log( "error on add image record!",error);
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

        console.log("deleting record at: ", imageRecord.storageLocation);

        await CameraRoll.deletePhotos([imageRecord.storageLocation]).catch(()=>{
            console.log("couldn't delete that one from the camera roll")
            });

        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Create Realm objects and write to local storage
                realm.write(() => {
                    realm.delete(imageRecord);
                    return "deleted"; // no error
                });
            })
            .catch((error) => {
                console.log( "error on remove image record!",error);
                return error // read error
            });
    }



}