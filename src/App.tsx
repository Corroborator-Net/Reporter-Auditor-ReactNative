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
import {
    requestCameraPermission,
    requestLocationPermission,
    requestStoragePermission,
    requestWritePermission
} from "./RequestPermissions";
import Geolocation from 'react-native-geolocation-service';
import NativeEncryptedLogbookStorage from "./NativeEncryptedLogbookStorage";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CameraView from "./CameraView";
import LogbookView from "./LogbookView";
import SettingsView from "./SettingsView";
import HashManager from "./HashManager";
import {LogManager} from "./LogManager";
import {Mesh} from "./interfaces/PeerCorroborators";
import {NativeAtraManager} from "./NativeAtraManager";
import NativeImageManager from "./NativeImageManager";
import NativeDID from "./NativeDID";

declare var global: {HermesInternal: null | {}};
const Tab = createBottomTabNavigator();



class App extends PureComponent{

    hashManager = new HashManager();
    storage = new NativeEncryptedLogbookStorage();
    identity = new NativeDID();
    peerCorroborators = new Mesh();
    imageManager = new NativeImageManager();
    blockchainManager = new NativeAtraManager();
    logManager = new LogManager(
        this.storage,
        this.identity,
        this.peerCorroborators,
        this.hashManager,
        this.blockchainManager,
    );

    async getNecessaryPermissions(){
        await requestCameraPermission();
        await requestLocationPermission();

    }
    componentDidMount(): void {
        this.getNecessaryPermissions();
        // this.testGPS()
  }


  async testGPS(){
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
          <Tab.Navigator initialRouteName="Logs" tabBarOptions={{ activeTintColor: '#0000FF', }}>

                <Tab.Screen name="Settings" options={{
                tabBarLabel: 'Settings',
                tabBarIcon:(({focused,color,size})=>
                  <Icon name={"settings"} color={color} size={size} />
                )}}>
                {props => <SettingsView {...props} /> }
                </Tab.Screen>

                <Tab.Screen name="Camera" options={{
                  tabBarLabel: 'Camera',
                  tabBarIcon:(({focused,color,size})=>
                      <Icon name={"camera"} color={color} size={size} />
                  )}}>
                  {props => <CameraView {...props}
                                        imageDatabase={this.imageManager}
                                        logManager={this.logManager}
                  /> }
                </Tab.Screen>

                <Tab.Screen name="Logs" options={{
                  tabBarLabel: 'Logs',
                    tabBarIcon:(({focused,color,size})=>
                            <Icon name={"file-cabinet"} color={color} size={size} />
                    )
                }}>
                {props => <LogbookView {...props}
                            logSource={this.storage} imageSource={this.imageManager}

                /> }
                </Tab.Screen>



          </Tab.Navigator>
        </NavigationContainer>
    );
  }




}

export default  App
