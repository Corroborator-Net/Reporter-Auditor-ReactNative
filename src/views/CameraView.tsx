import {RNCamera} from "react-native-camera";
import {StyleSheet, TouchableOpacity, View} from "react-native";
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation, {GeoPosition} from 'react-native-geolocation-service';
import CameraRoll from "@react-native-community/cameraroll";
import React from "react";
import {ImageDatabase} from "../interfaces/Storage";
import {ImageRecord,  LogMetadata} from "../interfaces/Data";
import {LogManager} from "../LogManager";
import {
    requestCameraPermission,
    requestLocationPermission,
    requestStoragePermission,
    requestWritePermission
} from "../utils/RequestPermissions";
import SettingsView from "./SettingsView";
import {waitMS} from "../utils/Constants";

type State={
    camera:any
    position:GeoPosition
}
type Props={
    imageDatabase:ImageDatabase
    logManager:LogManager
}

export default class CameraView extends React.PureComponent<Props, State> {

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

        const exifAppend: { [name: string]: any } = {};
        exifAppend[LogMetadata.GPSLat] = this.state.position.coords.latitude;
        exifAppend[LogMetadata.GPSLong] = this.state.position.coords.longitude;
        exifAppend[LogMetadata.GPSAlt] = this.state.position.coords.altitude;
        exifAppend[LogMetadata.GPSSpeed] = this.state.position.coords.speed;
        exifAppend[LogMetadata.GPSAcc] = this.state.position.coords.accuracy;
        exifAppend[LogMetadata.Comment] = SettingsView.UserSettings.get("Photo Details");

        // TODO we can pass doNotSave:boolean if we can just use the base64
        const options = {quality: 0.2, base64: true, writeExif: exifAppend, exif: true};
        const data = await this.state.camera.takePictureAsync(options);

        // Add filename to metadata
        data.exif[LogMetadata.FileName] = data.uri.slice(data.uri.lastIndexOf("/") + 1,data.uri.length);

        await CameraRoll.saveToCameraRoll(data.uri, "photo");
        // construct image record here
        const imageData = new ImageRecord(new Date(),
            data.uri,
            "",
            data.pictureOrientation,
            data.deviceOrientation,
            data.base64,
            data.exif);
        console.log("length of base64 img: " + data.base64.length);
        // add image to image database
        this.props.imageDatabase.add(imageData);
        // tell log manager we produced data to hash
        this.props.logManager.OnDataProduced(imageData)

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
