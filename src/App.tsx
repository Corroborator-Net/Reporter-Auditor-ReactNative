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
import EncryptedStorage from "./EncryptedStorage";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import CameraView from "./CameraView";
import LogbookView from "./LogbookView";
import SettingsView from "./SettingsView";
import HashManager from "./HashManager";
import {LogManager} from "./LogManager";
import DID from "./interfaces/Identity";
import {Mesh} from "./interfaces/PeerCorroborators";

declare var global: {HermesInternal: null | {}};
const Tab = createBottomTabNavigator();



class App extends PureComponent{

    hashManager = new HashManager();
    storage = new EncryptedStorage();
    identity = new DID();
    peerCorroborators = new Mesh();
    logManager = new LogManager(
        this.storage,
        this.identity,
        this.peerCorroborators,
        this.hashManager
    );

    async getNecessaryPermissions(){
        await requestStoragePermission();
        await requestWritePermission();
        await requestCameraPermission();
        await requestLocationPermission();

    }
    componentDidMount(): void {
        this.getNecessaryPermissions();
    // this.testGPS()
      /*
    1. hash module
    2. storage module local and/or cloud
    3. DID/Signing module:
    1. optional: log who are your trusted peers - accepting from, pushing to. Quasi credential layer - e.g. "I trust this person"
    5. corroborator peers module:
        1. hash receipt and/or file receipt
        2. corroborator opt-in supply:
            3. mesh
            4. chat
    6. web3 publish module
    7. Trusted/trust peers module
        1. which users you will accept validation requests from
        2. need a request trust peer method
      * */
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
                                        imageDatabase={this.storage}
                                        hashManager={this.hashManager}
                  /> }
                </Tab.Screen>

                <Tab.Screen name="Logs" options={{
                  tabBarLabel: 'Logs',
                    tabBarIcon:(({focused,color,size})=>
                            <Icon name={"file-cabinet"} color={color} size={size} />
                    )
                }}>
                {props => <LogbookView {...props}
                            logSource={this.storage}
                /> }
                </Tab.Screen>



          </Tab.Navigator>
        </NavigationContainer>
    );
  }




}

export default  App
