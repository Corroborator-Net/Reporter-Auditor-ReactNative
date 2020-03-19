import {RNCamera} from "react-native-camera";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation, {GeoPosition} from 'react-native-geolocation-service';
import CameraRoll from "@react-native-community/cameraroll";
import React from "react";
import {ImageDatabase} from "../interfaces/Storage";
import {ImageRecord,  LogMetadata} from "../interfaces/Data";
import {LogManager} from "../shared/LogManager";
import {
    requestCameraPermission,
    requestLocationPermission,
    requestStoragePermission,
    requestWritePermission
} from "../utils/RequestPermissions";
import {GetPathToCameraRoll, UserPreferenceKeys, waitMS} from "../utils/Constants";
import NativeUserPreferences from "../native/NativeUserPreferences";

type State={
    camera:any
    position:GeoPosition
}
type Props={
    imageDatabase:ImageDatabase
}

export default class NativeCameraView extends React.PureComponent<Props, State> {

    constructor(props:Props) {
        super(props);
    }
    async getPermission(){
        await waitMS(1000);

        await requestStoragePermission();
        await requestWritePermission();
        await requestCameraPermission();
    }


    async startWatchingGPS(){
        await waitMS(4000);
        await requestLocationPermission();
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
        await requestLocationPermission();
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
    }


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

                    style={styles.preview}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                    androidCameraPermissionOptions={{
                        title: 'Permission to use camera',
                        message: 'We need your permission to use your camera',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    androidRecordAudioPermissionOptions={{
                        title: 'Permission to use audio recording',
                        message: 'We need your permission to use your audio',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    onGoogleVisionBarcodesDetected={({ barcodes }) => {
                        // console.log(barcodes);
                    }}
                />
                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture} >
                        <Icon name={"checkbox-blank-circle"} color={"white"} size={60} />
                    </TouchableOpacity>
                </View>
            </View>
            </>

        )
    }



    takePicture = async() => {

        if (!this.state.camera) {
            return;
        }

        const exifAppend: { [name: string]: any } = {
            [LogMetadata.GPSLat]:this.state.position.coords.latitude,
            [LogMetadata.GPSLong]: this.state.position.coords.longitude,
            [LogMetadata.GPSAlt] : this.state.position.coords.altitude,
            [LogMetadata.GPSSpeed] : this.state.position.coords.speed,
            [LogMetadata.GPSAcc] :this.state.position.coords.accuracy,
            [LogMetadata.ImageDescription] :
                NativeUserPreferences.Instance.GetCachedUserPreference(UserPreferenceKeys.ImageDescription)[0],
        };


        // TODO we can pass doNotSave:boolean if we can just use the base64
        const options = {quality: 0.2, base64: true, writeExif: exifAppend, exif: true};
        const data = await this.state.camera.takePictureAsync(options);

        // Add filename to metadata
        const fileName = data.uri.slice(data.uri.lastIndexOf("/") + 1);
        data.exif[LogMetadata.FileName] = fileName;
        const fullPath = GetPathToCameraRoll(fileName);

        await CameraRoll.saveToCameraRoll(data.uri, "photo");
        // construct image record here
        const imageData = new ImageRecord(
            new Date(),
            fullPath,
            "",
            "",
            "",
            data.exif);


        // Log manager fills the base64 data for us TODO: let's store a thumbnail, not the entire image
        LogManager.Instance.LoadFileToGetBase64AndHash(imageData).then(data=>{
            imageData.base64Data = data[0];
            imageData.currentMultiHash = data[1];
            imageData.rootMultiHash = data[1];
            // console.log("imagedata's hash:", imageData.currentMultiHash);
            this.props.imageDatabase.add(imageData);
            LogManager.Instance.OnHashProduced(imageData);
        });

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