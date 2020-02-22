/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import React from "react";
require('node-libs-react-native/globals');
AppRegistry.registerComponent(appName, ()=>App);

require('./App.tsx');
