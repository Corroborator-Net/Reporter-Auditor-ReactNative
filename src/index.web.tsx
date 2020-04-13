// index.web.js

import App from './App.web';
import React from 'react';
import { AppRegistry } from 'react-native';

// register the app
AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
    initialProps: {},
    rootTag: document.getElementById('root')
});
