import React from "react";
import CameraRoll, {PhotoIdentifier} from "@react-native-community/cameraroll";

export default class ImageManager  {
    
    // TODO inject picture grabber dependency here: (i.e. ipfs picture fetcher or local cameraroll)
    public static PictureSource = CameraRoll;

    public static async LoadImagesFromCameraRoll(first:number) :Promise<Array<PhotoIdentifier>> {
        return ImageManager.PictureSource.getPhotos({
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



}