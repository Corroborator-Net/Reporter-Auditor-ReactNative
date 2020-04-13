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
import { BrowserRouter, Route, Link, useHistory } from 'react-router-dom'
import {View, Text} from "react-native";


function navigation() {

    const history = useHistory();
    function navigate(path:string, title:string){
        console.log("history is!",history, " and path:", path)
        history.push("/"+path)
    }

}


class App extends React.PureComponent {
    blockchainManager = new AtraManager();
    corroboratedImagesAndLogbookManager = new WebLogbookAndImageManager();
    hashManager = new HashManager();
    identity = new CrossPlatformIdentity();
    userPreferences = new NativeUserPreferences(this.identity);
    logbookStateKeeper = new LogbookStateKeeper(
        this.userPreferences,
        this.blockchainManager ,
        this.blockchainManager);
    navigation = navigation();

    render(){
      return (
          <html style={{height:"100%"}}>
          <body style={{height:"100%"}}>
          <div className="App">
          <div id="root" style={{display:"flex",height:"100%"}}>
              <BrowserRouter>
                  <View style={{height:500, width:500}}>
                      {/*<View >*/}
                      {/*    <Link to="/">*/}
                      {/*        <Text>Home</Text>*/}
                      {/*    </Link>*/}
                      {/*    <Link to="/about">*/}
                      {/*        <Text>About</Text>*/}
                      {/*    </Link>*/}
                      {/*</View>*/}

                      <Route exact path="/" render={(props)=>
                          <MultiLogbookView {...props}
                          imageSource={this.corroboratedImagesAndLogbookManager}
                          logbookStateKeeper={this.logbookStateKeeper}
                          blockchainInterface={this.blockchainManager}
                          userPreferences={this.userPreferences}
                          identity={this.identity}
                          navigation={this.navigation}
                          />}
                      />
                      <Route exact path={"/"+CorroborateLogsViewNameAndID} render={(props)=>
                          <SingleLogbookView {...props}
                                 imageSource={this.corroboratedImagesAndLogbookManager}
                                 logbookStateKeeper={this.logbookStateKeeper}
                                 navigation={this.navigation}
                                 route={{params:{title:"Logbook"}}}
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
