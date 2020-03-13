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
import NativeEncryptedLogbookStorage from "./native/NativeEncryptedLogbookStorage";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NativeCameraView from "./views/NativeCameraView";
import SingleLogbookView from "./views/SingleLogbookView";
import SettingsView from "./views/SettingsView";
import HashManager from "./native/HashManager";
import {LogManager} from "./native/LogManager";
import {Mesh} from "./interfaces/PeerCorroborators";
import {NativeAtraManager} from "./native/NativeAtraManager";
import NativeImageStorage from "./native/NativeImageStorage";
import NativeDID from "./native/NativeDID";
import NativeUserPreferences from "./native/NativeUserPreferences";
import DetailsScreen from "./components/LogDetailScreen";
import {createStackNavigator } from '@react-navigation/stack';
import {DetailsScreenName} from "./utils/Constants";
import MultiLogbookView from "./views/MultiLogbookView";

declare var global: {HermesInternal: null | {}};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

class App extends PureComponent{
    userPreferences = NativeUserPreferences.Instance;
    hashManager = new HashManager();
    storage = new NativeEncryptedLogbookStorage();
    identity = new NativeDID();
    peerCorroborators = new Mesh();
    imageManager = new NativeImageStorage();
    blockchainManager = new NativeAtraManager();

    logManager = new LogManager(
        this.storage,
        this.identity,
        this.peerCorroborators,
        this.hashManager,
        this.blockchainManager,
        this.userPreferences,
    );

  render() {

    return (
        <NavigationContainer>
          <Tab.Navigator initialRouteName="Logs" tabBarOptions={{ activeTintColor: '#0077FF', }}>

                <Tab.Screen name="Settings" options={{
                tabBarLabel: 'Settings',
                tabBarIcon:(({focused,color,size})=>
                  <Icon name={"settings"} color={color} size={size} />
                )}}>
                {props => <SettingsView {...props}
                /> }
                </Tab.Screen>

                <Tab.Screen name="Camera" options={{
                  tabBarLabel: 'Camera',
                  tabBarIcon:(({focused,color,size})=>
                      <Icon name={"camera"} color={color} size={size} />
                  )}}>
                  {props => <NativeCameraView {...props}
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
              {props =>
                  <Stack.Navigator>
                      <Stack.Screen name={"Logbooks"}>
                          {(props:any) =>
                              <MultiLogbookView {...props}
                                                 imageSource={this.imageManager}
                                                 logbookStateKeeper={this.userPreferences}
                                                 blockchainInterface={this.blockchainManager}
                                                 userPreferences={this.userPreferences}
                              />
                          }
                      </Stack.Screen>
                      <Stack.Screen name={"Logs"}>
                          {(props:any) =>
                              <SingleLogbookView {...props}
                                                 logSource={this.storage}
                                                 imageSource={this.imageManager}
                                                 logbookStateKeeper={this.userPreferences}
                              />
                          }
                      </Stack.Screen>
                      <Stack.Screen name={DetailsScreenName} component={DetailsScreen} />
                  </Stack.Navigator>
              }
              </Tab.Screen>

          </Tab.Navigator>
        </NavigationContainer>
    );
  }




}

export default  App
