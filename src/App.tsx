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
import HashManager from "./shared/HashManager";
import {LogManager} from "./shared/LogManager";
import {Mesh} from "./interfaces/PeerCorroborators";
import {NativeAtraManager} from "./native/NativeAtraManager";
import NativeImageStorage from "./native/NativeImageStorage";
import NativeDID from "./native/NativeDID";
import NativeUserPreferences from "./native/NativeUserPreferences";
import DetailLogView from "./views/DetailLogView";
import {createStackNavigator } from '@react-navigation/stack';
import {AppButtonTint, DetailLogViewName, EditLogsViewName, LoadingSpinner} from "./utils/Constants";
import MultiLogbookView from "./views/MultiLogbookView";
import EditLogView from "./views/EditLogView";
import {Button} from "react-native-elements";
import AuthenticationView from "./views/AuthenticationView";

declare var global: {HermesInternal: null | {}};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

class App extends PureComponent{
    state={
        loading:true,
        loggedIn:false
    };

    userPreferences = NativeUserPreferences.Instance;
    hashManager = new HashManager();
    storage = new NativeEncryptedLogbookStorage();
    identity = new NativeDID();

    peerCorroborators = new Mesh();
    imageStorage = new NativeImageStorage();
    blockchainManager = new NativeAtraManager();

    logManager = new LogManager(
        this.storage,
        this.identity,
        this.peerCorroborators,
        this.hashManager,
        this.blockchainManager,
        this.userPreferences,
        this.imageStorage,
    );
    componentDidMount = async() => {
        await this.identity.Initialize();
        const loggedIn = await this.identity.LoggedIn();

        // if we're not logged in, show authentication view and stop loading
        this.setState({
            loading: loggedIn,
            loggedIn:loggedIn,
        });

        // if we're logged in, load user prefs
        if (loggedIn){
            NativeUserPreferences.Initialize().then(()=>{
                this.setState({
                    loading:false
                })
            });
        }


    };

    render() {
        return (
            this.state.loading ?
                LoadingSpinner
                :
                !this.state.loggedIn ?
                    <AuthenticationView
                        identity={this.identity}
                    />
                    :
                <NavigationContainer>
                    <Tab.Navigator initialRouteName="Logs" tabBarOptions={{activeTintColor: AppButtonTint,}}>

                        <Tab.Screen name="Settings" options={{
                            tabBarLabel: 'Settings',
                            tabBarIcon: (({focused, color, size}) =>
                                    <Icon name={"settings"} color={color} size={size}/>
                            )
                        }}>
                            {props => <SettingsView {...props}
                            />}
                        </Tab.Screen>

                        <Tab.Screen name="Camera" options={{
                            tabBarLabel: 'Camera',
                            tabBarIcon: (({focused, color, size}) =>
                                    <Icon name={"camera"} color={color} size={size}/>
                            )
                        }}>
                            {props => <NativeCameraView {...props}
                                                        logbookStateKeeper={this.userPreferences}
                                                        imageDatabase={this.imageStorage}
                            />}
                        </Tab.Screen>

                        <Tab.Screen name="Logs" options={{
                            tabBarLabel: 'Logs',
                            tabBarIcon: (({focused, color, size}) =>
                                    <Icon name={"file-cabinet"} color={color} size={size}/>
                            )
                        }}>
                            {props =>
                                <Stack.Navigator>
                                    <Stack.Screen name={"Logbooks"}>
                                        {(props: any) =>
                                            <MultiLogbookView {...props}
                                                              imageSource={this.imageStorage}
                                                              logbookStateKeeper={this.userPreferences}
                                                              blockchainInterface={this.blockchainManager}
                                                              userPreferences={this.userPreferences}
                                            />
                                        }
                                    </Stack.Screen>
                                    <Stack.Screen name={"Logs"}>
                                        {(props: any) =>
                                            <SingleLogbookView {...props}
                                                               logSource={this.storage}
                                                               imageSource={this.imageStorage}
                                                               logbookStateKeeper={this.userPreferences}
                                            />
                                        }
                                    </Stack.Screen>
                                    <Stack.Screen name={DetailLogViewName}>
                                        {(props: any) =>
                                            <DetailLogView {...props}
                                                           logbookStateKeeper={this.userPreferences}
                                            />
                                        }
                                    </Stack.Screen>
                                    <Stack.Screen name={EditLogsViewName}>
                                        {(props: any) =>
                                            <EditLogView {...props}
                                                         logbookStateKeeper={this.userPreferences}
                                                         logManager={this.logManager}
                                                         imageDatabase={this.imageStorage}
                                            />
                                        }
                                    </Stack.Screen>

                                </Stack.Navigator>
                            }
                        </Tab.Screen>

                    </Tab.Navigator>
                </NavigationContainer>

    );
  }




}

export default  App
