import React from "react";
import {Text, StyleSheet, Image, ScrollView, View} from "react-native";
import {ImageRecord, Log, LogbookEntry} from "../interfaces/Data";
import {LoadingSpinner, PrependJpegString, waitMS} from "../shared/Constants";
import {ListItem} from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {LogMetadata} from "../shared/LogMetadata";
import {Identity} from "../interfaces/Identity";
import LogbookStateKeeper from "../shared/LogbookStateKeeper";


type Props={
    route:any
    logbookStateKeeper:LogbookStateKeeper
    identity:Identity
}
type State={
    currentLogEntryInformation:JSX.Element[];
    rootLogEntryInformation:JSX.Element[];
    showRootInfo:boolean;
    showCurrentInfo:boolean;
    currentLogbook:LogbookEntry;
    previousLogbookHash:string;
    loading:boolean;
}

export default class DetailLogView extends React.Component<Props, State> {

    state={
        showRootInfo:false,
        showCurrentInfo:true,
        currentLogEntryInformation:new Array<JSX.Element>(),
        rootLogEntryInformation:new Array<JSX.Element>(),
        currentLogbook:this.props.logbookStateKeeper.CurrentSelectedLogs[0],
        previousLogbookHash:"",
        loading:true,
    };


    parseAndDisplayMetadata(log:Log, imageRecord:ImageRecord|null): Array<JSX.Element>{
        let details = new Array<JSX.Element>();
        let metadataObj:{[key:string]:string} = {};
        let logAndImageRecordMatch = true;

        if (imageRecord){
            const imageMetadata = JSON.parse(imageRecord.metadataJSON);

            if (log.currentDataMultiHash == imageRecord.currentMultiHash &&
                log.currentTransactionHash != "") {
                metadataObj["Log Status"] = "Logged";
                metadataObj["File Name"] = imageRecord.filename;
            }
            else {
                metadataObj["Log Status"] = "Not Yet Logged";
                logAndImageRecordMatch = false;
            }

            // we add all metadata except the above parsed stuff
            for (const key of Object.keys(imageMetadata)) {
                if (key == LogMetadata.ImageDescription){
                    const description =  ImageRecord.GetExtraImageInformation(imageRecord);
                    metadataObj[key] = description ? description.Description: "none";
                    continue;
                }
                metadataObj[key] = imageMetadata[key];
            }
        }

        if (logAndImageRecordMatch) {
            if (log.encryptedMetadataJson != "") {
                const encryptedMetadata = JSON.parse(new LogMetadata(
                    null, null, null,
                    log.encryptedMetadataJson,
                    [this.props.identity.PublicPGPKey],
                    this.props.identity.PrivatePGPKey).JsonData())[this.props.identity.PublicPGPKey];
                for (const key of Object.keys(encryptedMetadata)) {
                    metadataObj[key] = encryptedMetadata[key];
                }
            }


            // get the other log key+values that aren't in the signed metadata (i.e. multihash, etc.)
            for (const key of Object.keys(log)) {
                //@ts-ignore
                const data = log[key];
                if (data != log.encryptedMetadataJson) {
                    metadataObj[key] = data;
                }
            }
        }



        Object.keys(metadataObj).
        forEach(function eachKey(key)
        {
            details.push(<Text key={key}> <Text style={{fontWeight:"bold"}}>{key}</Text>: {metadataObj[key]}</Text>);
        });
        return details;
    }


    async loadMetadata(){
        await waitMS(1);
        const currentLogbookInfo  = this.parseAndDisplayMetadata(this.state.currentLogbook.Log, this.state.currentLogbook.ImageRecord);
        // I might have a
        let canShowRootInfo = this.state.currentLogbook.RootLog.currentDataMultiHash != "" &&
            this.state.currentLogbook.Log.currentDataMultiHash != this.state.currentLogbook.RootLog.currentDataMultiHash;
        let rootInfo = new Array<JSX.Element>();
        if (canShowRootInfo){
            rootInfo = this.parseAndDisplayMetadata(this.state.currentLogbook.RootLog, this.state.currentLogbook.RootImageRecord)
        }
        this.setState({
            currentLogEntryInformation:currentLogbookInfo,
            rootLogEntryInformation:rootInfo,
            loading:false
        })
    }


  componentDidMount(): void {


      if (this.state.currentLogbook.Log.currentDataMultiHash != this.state.previousLogbookHash
      ) {
          this.setState({
              currentLogbook: this.props.logbookStateKeeper.CurrentSelectedLogs[0],
              previousLogbookHash: this.props.logbookStateKeeper.CurrentSelectedLogs[0].Log.currentDataMultiHash,
              loading:true
              },
              this.loadMetadata);
      }
  }

    render() {
        return (
              this.state.loading ?
                  LoadingSpinner
                  :
            <ScrollView>
                {this.state.currentLogbook.ImageRecord ?
                    <Image
                        source={{uri: PrependJpegString(this.state.currentLogbook.ImageRecord.base64Data)}}
                        resizeMethod={"resize"}
                        style={styles.image}
                    />
                    :
                    <></>
                }
                <ListItem
                    onPress={()=>this.setState({showCurrentInfo:!this.state.showCurrentInfo})}
                    title={"Most Recent Log Metadata"}
                    containerStyle={styles.title}
                    chevron={this.state.showCurrentInfo ?
                        <Icon name={"chevron-down"} size={20} color={"black"}/>
                        :
                        <Icon name={"chevron-right"} size={20} color={"black"}/>
                    }
                >
                </ListItem>
                {this.state.showCurrentInfo ?  this.state.currentLogEntryInformation : <></>}

                { this.state.rootLogEntryInformation.length>1 ?
                <ListItem
                    onPress={()=>this.setState({showRootInfo:!this.state.showRootInfo})}
                    title={"Original Log Metadata"}
                    containerStyle={styles.title}
                    chevron={this.state.showRootInfo ?
                      <Icon name={"chevron-down"} size={20} color={"black"}/>
                          :
                      <Icon name={"chevron-right"} size={20} color={"black"}/>
                    }
                >
                </ListItem>
                    :
                    <></>
                }
                {this.state.showRootInfo ? this.state.rootLogEntryInformation:<></>}
            </ScrollView>

        );


    }
}

const styles = StyleSheet.create({
    image:{
        resizeMode:"contain",
        height: 300,
        margin:10
    },
    title:{
        marginTop:10,
        marginBottom:10,
    }
});