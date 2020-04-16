import {RNCamera} from "react-native-camera";
import {Platform, StyleSheet, TouchableOpacity, View} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation, {GeoPosition} from 'react-native-geolocation-service';
import CameraRoll from "@react-native-community/cameraroll";
import React from "react";
import {ImageDatabase} from "../interfaces/Storage";
import {ImageDescriptionExtraInformation, ImageRecord} from "../interfaces/Data";
import {LogManager} from "../shared/LogManager";
import {
    requestCameraPermission,
    requestLocationPermission,
    requestStoragePermission,
    requestWritePermission
} from "../native/RequestPermissions";
import {GetPathToCameraRoll, OriginalAlbum, UserPreferenceKeys, waitMS} from "../shared/Constants";
import NativeUserPreferences from "../native/NativeUserPreferences";
import {Text} from "react-native-elements";
import RNFetchBlob from "rn-fetch-blob";
import HashManager from "../shared/HashManager";
import {LogMetadata} from "../shared/LogMetadata";
import {Identity} from "../interfaces/Identity";
import LogbookStateKeeper from "../shared/LogbookStateKeeper";

type State={
    camera:any
    position:GeoPosition
    logName:string
}
type Props={
    imageDatabase:ImageDatabase
    logbookStateKeeper:LogbookStateKeeper
    identity:Identity
    navigation:any
}

export default class NativeCameraView extends React.PureComponent<Props, State> {

    // state={
    //   camera:null,
    //   position:new GeoPosition(),
    //   logName:this.props.logbookStateKeeper.LogbookName(this.props.logbookStateKeeper.CurrentLogbookID)
    // };

    constructor(props:Props) {
        super(props);

    }
    async getPermission(){
        if (Platform.OS == "android") {
            await waitMS(1000);
            await requestStoragePermission();
            await requestWritePermission();
            await requestCameraPermission();
        }
    }


    async startWatchingGPS(){
        await waitMS(4000);
        if (Platform.OS == "android") {
            await requestLocationPermission();
        }
        Geolocation.watchPosition((position => {
            this.setState({position:position})
        }), (error => {
            console.log("gps error: ", error.code, error.message);
        }), {
            enableHighAccuracy: true,
            forceRequestLocation:true,
            showLocationDialog: false,
            distanceFilter:80,
            interval:10000,
            fastestInterval:5000,
        })
    }

    async getStartingGPSCoords(){
        if (Platform.OS == "android") {
            await requestLocationPermission();
        }
        Geolocation.getCurrentPosition(
          (position) => {
              this.setState({position:position})

          },
          (error) => {
            // See error code charts below.
            console.log("gps error: ", error.code, error.message);
          },
          {
              enableHighAccuracy: true,
              timeout: 1000,
              maximumAge: 10000,
              forceRequestLocation:true,
              showLocationDialog: false
          }
      );
    }


    componentDidMount(): void {
        this.getPermission();
        this.startWatchingGPS();
        this.getStartingGPSCoords();
        this.props.navigation.addListener('focus', this.onScreenFocus);

    }
    onScreenFocus = () => {
      this.setState({
          logName:this.props.logbookStateKeeper.LogbookName(this.props.logbookStateKeeper.CurrentLogbookID)
      })
    };

    render(){
        return(
            <>
            <View style={styles.container}>
                <RNCamera
                    ref={ref => {
                        this.setState({
                            camera:ref
                        })
                    }}
                    captureAudio={false}
                    style={styles.preview}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                    androidCameraPermissionOptions={{
                        title: 'Permission to use camera',
                        message: 'We need your permission to use your camera',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    // androidRecordAudioPermissionOptions={{
                    //     title: 'Permission to use audio recording',
                    //     message: 'We need your permission to use your audio',
                    //     buttonPositive: 'Ok',
                    //     buttonNegative: 'Cancel',
                    // }}
                    onGoogleVisionBarcodesDetected={({ barcodes }) => {
                        // console.log(barcodes);
                    }}
                />
                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture} >
                        <Icon name={"checkbox-blank-circle"} color={"white"} size={60} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', marginBottom:10, marginTop:-10 }}>
                    <Text style={{color:"white"}}> Logging to Case: {" "}
                        {this.state ? this.state.logName : this.props.logbookStateKeeper.LogbookName(this.props.logbookStateKeeper.CurrentLogbookID)}
                    </Text>
                </View>
            </View>
            </>

        )
    }



    takePicture = async() => {

        if (!this.state.camera) {
            return;
        }

        // TODO include the public key in the jpeg itself?
        const imageDescription:ImageDescriptionExtraInformation ={
            Description: NativeUserPreferences.Instance.GetCachedUserPreference(UserPreferenceKeys.ImageDescription)[0],
            // PublicKey:this.props.identity.PublicPGPKey,
            LogbookAddress:this.props.logbookStateKeeper.CurrentLogbookID,
            SignedLogbookAddress:this.props.identity.sign(this.props.logbookStateKeeper.CurrentLogbookID)
        };



        const exifAppend: { [name: string]: any } = {
            [LogMetadata.GPSLat]:this.state.position.coords.latitude,
            [LogMetadata.GPSLong]: this.state.position.coords.longitude,
            [LogMetadata.GPSAlt] : this.state.position.coords.altitude,
            [LogMetadata.GPSAccuracyReplacement]: this.state.position.coords.accuracy,
            [LogMetadata.ImageDescription] : JSON.stringify(imageDescription)
        };

        // console.log("exif:", exifAppend);

        // TODO we can pass doNotSave:boolean if we can just use the base64
        const options = {quality: 0.2, base64: true, writeExif: exifAppend, exif: true};
        const data = await this.state.camera.takePictureAsync(options);

        // Add filename to metadata
        const fileName = data.uri.slice(data.uri.lastIndexOf("/") + 1);
        // data.exif[LogMetadata.FileName] = fileName;
        const fullPath = GetPathToCameraRoll(fileName, true);

        await CameraRoll.save(data.uri, {type:'photo',album:OriginalAlbum});
        // construct image record here
        const imageRecord = new ImageRecord(
            new Date(),
            fullPath,
            "",
            "",
            "");

        if (Platform.OS == "ios"){
            const photos = await CameraRoll.getPhotos({first:1, groupName:OriginalAlbum});
            // console.log("photo at:",photos.edges[0].node.image.uri);
            imageRecord.storageLocation = photos.edges[0].node.image.uri;
            // https://emn178.github.io/online-tools/sha256_checksum.html produces matching hex hashes
            console.log("image base64:", data.base64.slice(0,50));
            const hash = HashManager.GetHashSync(data.base64);
            imageRecord.base64Data = data.base64;
            imageRecord.currentMultiHash = hash;
            imageRecord.rootMultiHash = hash;
            // just have to do this during our first save as the true exif is only included in the saved file
            imageRecord.metadataJSON = ImageRecord.GetMetadataAndExifObject(data.base64)[0];
            // console.log("imagedata's hash:", imageData.currentMultiHash);
            this.props.imageDatabase.add(imageRecord);
            LogManager.Instance.OnNewHashProduced(
                imageRecord,
                this.props.logbookStateKeeper.CurrentLogbookID,
                true
            );
        }

        else if (Platform.OS == "android") {

            RNFetchBlob.fs.readFile(imageRecord.storageLocation, 'base64')
                .then((base64Data) => {
                    // https://emn178.github.io/online-tools/sha256_checksum.html produces matching hex hashes
                    // console.log("image saved at:", imageData.storageLocation);
                    const hash = HashManager.GetHashSync(base64Data);
                    imageRecord.base64Data = base64Data;
                    imageRecord.currentMultiHash = hash;
                    imageRecord.rootMultiHash = hash;
                    // just have to do this during our first save as the true exif is only included in the saved file
                    imageRecord.metadataJSON = ImageRecord.GetMetadataAndExifObject(base64Data)[0];
                    // console.log("imagedata's hash:", imageData.currentMultiHash);
                    this.props.imageDatabase.add(imageRecord);
                    LogManager.Instance.OnNewHashProduced(
                        imageRecord,
                        this.props.logbookStateKeeper.CurrentLogbookID,
                        true
                    );
                })
        }
    }


}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: 'black',
        borderRadius: 5,
        padding: 5,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 10,
    },
});
