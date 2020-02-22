/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import React, { PureComponent} from 'react';
'use strict';
import {requestCameraPermission, requestLocationPermission} from "./RequestPermissions";
import Geolocation from 'react-native-geolocation-service';
import EncryptedStorage from "./EncryptedStorage";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from 'react-native-vector-icons';

import CameraView from "./CameraView";
import LogbookView from "./LogbookView";
import {Image} from "react-native";

const multihash = require('multihashes');

declare var global: {HermesInternal: null | {}};


const Tab = createBottomTabNavigator();
class App extends PureComponent{

  componentDidMount(): void {
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



  render() {
    return (
        <NavigationContainer>
          <Tab.Navigator initialRouteName="Camera"
              tabBarOptions={{
                activeTintColor: '#e91e63',
              }}>
            <Tab.Screen name="Camera" options={{
              tabBarLabel: 'Camera',
              // tabBarIcon:({focused,color,size})=>(
              //     <FontAwesome name={"envelope"} color={'black'}  />
              // )
              // tabBarIcon: ({ color, size }) => (
              //     <MaterialCommunityIcons name="bell" color={color} size={size} />
              // ),
            }}>
              {props => <CameraView {...props} imageDatabase={new EncryptedStorage()} /> }
            </Tab.Screen>
            <Tab.Screen name="Logs" component={LogbookView} options={{
              tabBarLabel: 'Logs',

              // tabBarIcon: ({ color, size }) => (
              //     <MaterialCommunityIcons name="home" color={color} size={size} />
              // ),
            }}/>
          </Tab.Navigator>
        </NavigationContainer>
    );
  }




}

export default  App
