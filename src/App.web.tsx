import React from 'react';
import './web-src/App.css';
import {AtraManager} from "./shared/AtraManager";
import WebLogbookAndImageManager from "./web/WebLogbookAndImageManager";
import HashManager from "./shared/HashManager";
import CrossPlatformIdentity from "./shared/CrossPlatformIdentity.web";
import NativeUserPreferences from "./native/NativeUserPreferences";
import LogbookStateKeeper from "./shared/LogbookStateKeeper";
import MultiLogbookView from "./views/MultiLogbookView";
import {CorroborateLogsViewNameAndID, DetailLogViewName} from "./shared/Constants";
import SingleLogbookView from "./views/SingleLogbookView";
import DetailLogView from "./views/DetailLogView";
import { BrowserRouter, Route } from 'react-router-dom'
import {View} from "react-native";
import TitleBar from "./components/TitleBar";
import {LogManager} from "./shared/LogManager.web";




class App extends React.PureComponent {
    blockchainManager = new AtraManager();
    corroboratedImagesAndLogbookManager = new WebLogbookAndImageManager();
    // singleton
    hashManager = new HashManager();
    identity = new CrossPlatformIdentity();
    userPreferences = new NativeUserPreferences(this.identity);
    logbookStateKeeper = new LogbookStateKeeper(
        this.userPreferences,
        this.blockchainManager ,
        this.blockchainManager);
    // singleton
    logManager = new LogManager(
        this.identity,
        this.blockchainManager,
        this.logbookStateKeeper,
        this.corroboratedImagesAndLogbookManager);

    render(){
      return (
          <html style={{height:"100%"}}>
          <body style={{height:"100%"}}>
          <div className="App">
          <div id="root" style={{display:"flex",height:"100%"}}>
              <BrowserRouter>
                  <View style={{display:"flex",height:"100%", width:"100%"}}>
                      <TitleBar/>
                      <Route exact path="/" render={(props)=>
                          <MultiLogbookView {...props}
                          imageSource={this.corroboratedImagesAndLogbookManager}
                          logbookStateKeeper={this.logbookStateKeeper}
                          blockchainInterface={this.blockchainManager}
                          userPreferences={this.userPreferences}
                          identity={this.identity}
                          navigation={null}
                          />}
                      />
                      <Route exact path={"/"+CorroborateLogsViewNameAndID} render={(props)=>
                          <SingleLogbookView {...props}
                                 imageSource={this.corroboratedImagesAndLogbookManager}
                                 logbookStateKeeper={this.logbookStateKeeper}
                                 route={{params:{title:"Logbook"}}}
                                 navigation={null}
                          />}
                      />
                      <Route exact path={"/"+DetailLogViewName} render={(props)=>
                        <DetailLogView {...props}
                                 logbookStateKeeper={this.logbookStateKeeper}
                                 identity={this.identity}
                               route={null}
                         />}
                      />
                  </View>
              </BrowserRouter>

          </div>
          </div>
          </body>
          </html>
      );
    }
}

export default App;
