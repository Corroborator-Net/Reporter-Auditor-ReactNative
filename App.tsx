/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

'use strict';
import { TouchableOpacity } from 'react-native';
import {RNCamera} from 'react-native-camera';
import {requestCameraPermission, requestLocationPermission} from "./RequestPermissions";
import Geolocation from 'react-native-geolocation-service';
import {ImageDatabase, ImageRecord} from "./Models";
import EncryptedStorage from "./EncryptedStorage";
import {DatabaseSource} from "./Constants";
const multihash = require('multihashes');

declare var global: {HermesInternal: null | {}};

type State={
  camera:any
  imageDatabase:ImageDatabase;

}

class App extends PureComponent<{}, State>{

  // TODO: move this out of this class
  determineDependencies(){
    let imageDatabase = new EncryptedStorage();
    if (DatabaseSource !== "local"){
      //setup to read from block explorer here
    }

    this.setState({
          imageDatabase:imageDatabase
        },
        this.testDB
    )
  }

  componentDidMount(): void {
    this.determineDependencies();
    this.testCamera();
    // this.testGPS()
    // this.testHash();
    // this.testDB();
  }

  testHash(){
    // @ts-ignore
    let buf = new Buffer('0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', 'hex');
    let encoded = multihash.encode(buf, 'sha2-256');
    console.log(encoded);
    let decoded = multihash.decode(encoded);
    console.log(decoded);
  }
  testCamera(){
    requestCameraPermission()
  }

  async testGPS(){
    await requestLocationPermission();
    Geolocation.getCurrentPosition(
        (position) => {
          console.log(position);

        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 1000, maximumAge: 10000}
    );
  }

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
    this.state.imageDatabase.add(newImageHash);
  }


  render() {
    return (
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
    );
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

export default  App
