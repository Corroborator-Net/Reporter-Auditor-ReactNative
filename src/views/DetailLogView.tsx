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
    // currentLogEntryInformation:JSX.Element[];
    currentLogBookEntry:LogbookEntry;
    previousLogbookHash:string;
    loading:boolean;
    showInfo:boolean[];
}

export default class DetailLogView extends React.Component<Props, State> {

    state={
        showInfo:new Array(100).fill(false),
        // currentLogEntryInformation:new Array<JSX.Element>(),
        // rootLogEntryInformation:new Array<JSX.Element>(),
        currentLogBookEntry:this.props.logbookStateKeeper.CurrentSelectedLogs[0],
        previousLogbookHash:"",
        loading:true,
    };

    imageRecordHasBeenLogged(log:Log, imageRecord:ImageRecord):boolean{
        // we might be displaying the most recent image record, in which case the root log will show it hasn't been logged yet
        return (log.currentDataMultiHash == imageRecord.currentMultiHash &&
                log.currentTransactionHash != "")
            || (log.currentDataMultiHash == imageRecord.rootMultiHash &&
                log.currentTransactionHash!= "")
    }

    parseAndDisplayMetadata(log:Log, imageRecord:ImageRecord|null): JSX.Element{
        let details = new Array<JSX.Element>();
        let metadataObj:{[key:string]:string} = {};
        let imageRecordHasBeenLogged = false;

        if (imageRecord){
            const imageMetadata = JSON.parse(imageRecord.metadataJSON);

            if (this.imageRecordHasBeenLogged(log,imageRecord)) {
                metadataObj["Log Status"] = "Logged";
                metadataObj["File Name"] = imageRecord.filename;
                imageRecordHasBeenLogged = true;
            }
            else {
                metadataObj["Log Status"] = "Not Yet Logged";
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

        if (imageRecordHasBeenLogged || !imageRecord) {
            // console.log("encrypted metadata:",log.encryptedMetadataJson)
            if (log.encryptedMetadataJson != "") {
                const encryptedMetadata = JSON.parse(new LogMetadata(
                    null, null, null,
                    log.encryptedMetadataJson,
                    this.props.identity.PrivatePGPKey).JsonData());

                // console.log("encryptedMetadata",encryptedMetadata);

                if (!encryptedMetadata){
                    metadataObj["On-Chain Encrypted Metadata"] = "Unable to Decrypt";
                }
                else {
                    for (const key of Object.keys(encryptedMetadata)) {
                        metadataObj[key] = encryptedMetadata[key];
                    }
                }
            }


            // get the other log key+values that aren't in the signed metadata (i.e. multihash, etc.)
            for (const key of Object.keys(log)) {
                //@ts-ignore
                const data = log[key] ? log[key].toString() : log[key]
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
        return <View>{details}</View>;
    }


    async loadMetadata(){
        await waitMS(1);
        // const currentLogbookInfo  = this.parseAndDisplayMetadata(this.state.currentLog.Log, this.state.currentLog.ImageRecord);
        // // I might have a
        // let canShowRootInfo = this.state.currentLog.RootLog.currentDataMultiHash != "" &&
        //     this.state.currentLog.Log.currentDataMultiHash != this.state.currentLog.RootLog.currentDataMultiHash;
        // let rootInfo = new Array<JSX.Element>();
        // if (canShowRootInfo){
        //     rootInfo = this.parseAndDisplayMetadata(this.state.currentLog.RootLog, this.state.currentLog.RootImageRecord)
        // }
        this.setState({
            // currentLogEntryInformation:currentLogbookInfo,
            // rootLogEntryInformation:rootInfo,
            loading:false
        })
    }


  componentDidMount(): void {


      if (this.state.currentLogBookEntry.HeadLog.currentDataMultiHash != this.state.previousLogbookHash
      ) {
          this.setState({
              currentLogBookEntry: this.props.logbookStateKeeper.CurrentSelectedLogs[0],
              previousLogbookHash: this.props.logbookStateKeeper.CurrentSelectedLogs[0].HeadLog.currentDataMultiHash,
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
                {this.state.currentLogBookEntry.HeadImageRecord ?
                    <Image
                        source={{uri: PrependJpegString(this.state.currentLogBookEntry.HeadImageRecord.base64Data)}}
                        resizeMethod={"resize"}
                        style={styles.image}
                    />
                    :
                    <></>
                }
                {this.state.currentLogBookEntry.OrderedRevisionsStartingAtHead.map((node, index)=>{
                    return (<ListItem
                        onPress={()=>{
                            let prevInfo = this.state.showInfo;
                            prevInfo[index] = !prevInfo[index];
                            this.setState({showInfo:prevInfo})
                        }}
                        key={node.log.currentDataMultiHash + index}
                        title={index==this.state.currentLogBookEntry.OrderedRevisionsStartingAtHead.length-1 ? "Root Log Metadata":
                        index == 0 ? "Most Recent Log Metadata" : "Log @ " + node.log.blockTimeOrLocalTimeOrBlockNumber}
                        containerStyle={styles.title}
                        chevron={this.state.showInfo[index] ?
                            <Icon name={"chevron-down"} size={20} color={"black"}/>
                            :
                            <Icon name={"chevron-right"} size={20} color={"black"}/>
                        }
                        subtitle={this.state.showInfo[index] ?
                            this.parseAndDisplayMetadata(node.log, node.imageRecordIsBlank ? null : node.imageRecord)
                            : <></>}
                        >

                        </ListItem>
                            )})
                }

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