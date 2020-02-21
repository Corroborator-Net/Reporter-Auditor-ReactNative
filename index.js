/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import EncryptedStorage from "./EncryptedStorage";
import React from "react";
require('node-libs-react-native/globals');
// const mainApp = () => (
// <App imageDatabase={ new EncryptedStorage()} />
// );
AppRegistry.registerComponent(appName, ()=>App);
// AppRegistry.runApplication(appName,
//     {
//         rootTag:<App/>,
//         initialProps: {imageDatabase:defaultStorage}});

require('./App.tsx');
