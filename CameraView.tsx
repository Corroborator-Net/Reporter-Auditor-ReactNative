import {RNCamera} from "react-native-camera";
import { StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React from "react";
import {ImageDatabase, ImageRecord} from "./Models";

type State={
    camera:any
}
type Props={
    imageDatabase:ImageDatabase
}
export default class CameraView extends React.PureComponent<Props, State>{

    testDB(){
        console.log("hello!")
        const date = new Date();
        // const date = new Date();
        const newImageHash = new ImageRecord( date,"here",
            "imageData",
            1,
            2,
            {"hash1":"hi"},
            "howdy"
        );
        console.log(newImageHash.timestamp);
        this.props.imageDatabase.add(newImageHash);
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
                        console.log(barcodes);
                    }}
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
        if (this.state.camera) {
            const exifAppend = {"GPSLatitude": 10.21, "GPSLongitude": 1.02, "UserComment":"Hi!"};
            const options = { quality: 1.0, base64: true, writeExif: exifAppend, exif:true };
            const data = await this.state.camera.takePictureAsync(options);
            console.log(data.exif);
            console.log(data.uri);

        }
    };
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
