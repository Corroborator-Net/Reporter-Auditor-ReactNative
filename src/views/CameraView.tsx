import {RNCamera} from "react-native-camera";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import CameraRoll from "@react-native-community/cameraroll";
import React from "react";
import {ImageDatabase} from "../interfaces/Storage";
import { ImageRecord} from "../interfaces/Data";
import HashManager from "../HashManager";
import {LogManager} from "../LogManager";
import {
    requestCameraPermission,
    requestLocationPermission,
    requestStoragePermission,
    requestWritePermission
} from "../utils/RequestPermissions";
import Geolocation, {GeoPosition} from "react-native-geolocation-service";

type State={
    camera:any
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
        await requestStoragePermission();
        await requestWritePermission();
        await requestCameraPermission();
        await requestLocationPermission();
    }
    componentDidMount(): void {
        this.getPermission();
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
                    // onGoogleVisionBarcodesDetected={({ barcodes }) => {
                    //     // console.log(barcodes);
                    // }}
                />
                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.capture}>
                        <Text style={{ fontSize: 14 }}> SNAP </Text>
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
        Geolocation.getCurrentPosition(
             (position) => {
                 const loadLocation = async (position:GeoPosition) => {
                     const exifAppend = {
                         "GPSLatitude": position.coords.latitude,
                         "GPSLongitude": position.coords.longitude,
                         "UserComment":"Hi!"
                     };
                     // TODO we can pass doNotSave:boolean if we can just use the base64
                     const options = { quality: 0.2, base64: true, writeExif: exifAppend, exif:true };
                     const data = await this.state.camera.takePictureAsync(options);
                     await CameraRoll.saveToCameraRoll(data.uri, "photo");
                     // construct image record here
                     const imageData = new ImageRecord(new Date,
                         data.uri,
                         "",
                         data.pictureOrientation,
                         data.deviceOrientation,
                         data.base64,
                         data.exif);
                     // add image to image database
                     this.props.imageDatabase.add(imageData);
                     // tell log manager we produced data to hash
                     this.props.logManager.OnDataProduced(imageData)
                 }
                 loadLocation(position)
             },
            (error) => {
                // See error code charts below.
                console.log("error on get location:", error.message);
                return;
            },
            { enableHighAccuracy: true, timeout: 1000, maximumAge: 10000}
        );

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
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
});
