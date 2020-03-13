/**
 * @format
 */
import './shim.js'
import crypto from 'crypto'
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './src/native/App';
import {name as appName} from './app.json';
import React from "react";
require('node-libs-react-native/globals');
AppRegistry.registerComponent(appName, ()=>App);

require('./src/native/App.js');
