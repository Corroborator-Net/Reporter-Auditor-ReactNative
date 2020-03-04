import {RNCamera} from "react-native-camera";
import {StyleSheet, TouchableOpacity, View} from "react-native";
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

        if (this.state.camera) {
            // TODO: find npm package that finds gps coords even when in airplane mode
            // see: https://github.com/airtonazevedo/react-native-geolocation-offline-and-airplanemode
            const exifAppend = {};
            //@ts-ignore
            exifAppend[LogMetadata.GPSLat] = 39.7722476;
            //@ts-ignore
            exifAppend[LogMetadata.GPSLong] = -105.0464564;
            //@ts-ignore
            exifAppend[LogMetadata.GPSAcc] = 16.913999557495117;
            //@ts-ignore
            exifAppend[LogMetadata.Comment] = "Hello";

            // TODO we can pass doNotSave:boolean if we can just use the base64
            const options = {quality: 0.2, base64: true, writeExif: exifAppend, exif: true};
            const data = await this.state.camera.takePictureAsync(options);

            await CameraRoll.saveToCameraRoll(data.uri, "photo");
            // construct image record here
            const imageData = new ImageRecord(new Date(),
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
