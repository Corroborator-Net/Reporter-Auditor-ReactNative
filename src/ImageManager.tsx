import React from "react";
import CameraRoll, {PhotoIdentifier} from "@react-native-community/cameraroll";

export default class ImageManager  {
    public static async LoadImagesFromCameraRoll(first:number) :Promise<Array<PhotoIdentifier>> {
        return CameraRoll.getPhotos({
            first: first,
            assetType: 'Photos',
        })
            .then(r => {
                console.log(r.edges[0].node.image.uri);
                return (r.edges)
            })
            .catch((err) => {
                //Error Loading Images
                return(err)
            });
    };

    // listPhotos(){
    //
    //     //@ts-ignore
    //     this.state.photos.map((p, i) => {
    //
    //         RNFetchBlob.fs.readFile(p.node.image.uri, 'base64')
    //             .then((data) => {
    //                 // https://emn178.github.io/online-tools/sha256_checksum.html produces matching hex hashes
    //                 console.log("logbook reading file at: " + p.node.image.uri);
    //                 // @ts-ignore
    //                 let buf = Buffer.from(data, 'base64');
    //                 let encoding = 'hex';
    //                 const hash = HashManager.TestHash().update(buf).digest(encoding);
    //                 console.log(encoding + " encoded hash: " + hash);
    //             })
    //     });
    //
    // }

}