/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {Component, PureComponent} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import EncryptedStorage, {ImageHash} from "./EncryptedStorage";
'use strict';
import { TouchableOpacity } from 'react-native';
import { RNCamera } from 'react-native-camera';
import {requestCameraPermission} from "./RequestPermissions";
const multihash = require('multihashes');


declare var global: {HermesInternal: null | {}};

type State={
  camera:any
}

class App extends PureComponent<{}, State>{

  testHash(){
    // @ts-ignore
    let buf = new Buffer('0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', 'hex');
    let encoded = multihash.encode(buf, 'sha2-256');
    console.log(encoded);
    let decoded = multihash.decode(encoded);
    console.log(decoded);
  }

  testDB(){
    // const date = new Date();
    const date = new Date();
    const newImageHash = new ImageHash( date,"here","hash1","howdy");
    console.log(newImageHash.timestamp);
    EncryptedStorage.Save(newImageHash);
  }

  testCamera(){
    requestCameraPermission()
  }

  componentDidMount(): void {
    this.testCamera();
    this.testHash();
    this.testDB();
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
              flashMode={RNCamera.Constants.FlashMode.on}
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
      const options = { quality: 0.5, base64: true };
      const data = await this.state.camera.takePictureAsync(options);
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
