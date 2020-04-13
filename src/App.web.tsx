import React from 'react';
import './web-src/App.css';
import {Text, View} from "react-native";
import {AtraManager} from "./shared/AtraManager";
import WebLogbookAndImageManager from "./web/WebLogbookAndImageManager";
import HashManager from "./shared/HashManager";
import CrossPlatformIdentity from "./shared/CrossPlatformIdentity.web";

class App extends React.PureComponent {
    blockchainManager = new AtraManager();
    corroboratedImagesAndLogbookManager = new WebLogbookAndImageManager();
    hashManager = new HashManager();
    identity = new CrossPlatformIdentity();

    render(){
      return (
          <html style={{height:"100%"}}>
          <body style={{height:"100%"}}>
          <div className="App">
          <div id="root" style={{display:"flex",height:"100%"}}>
          <View style={{width:100}}><Text>Hello!!</Text></View>
          <View style={{height:100}}><Text>Hello!!</Text></View>
          <View style={{height:100}}><Text>Hello!!</Text></View>

        </div>
          </div>
          </body>
          </html>
      );
    }
}

export default App;
