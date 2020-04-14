import React from "react";
import {Text, StyleSheet, Image, ScrollView, View} from "react-native";
import {ImageRecord, Log, LogbookEntry, RevisionNode} from "../interfaces/Data";
import {
    GetLocalTimeFromSeconds,
    KeysToNamesMap,
    OrdinalSuffixOf,
    PrependJpegString,
    prettyPrint
} from "../shared/Constants";
import {LogMetadata} from "../shared/LogMetadata";
import {Identity} from "../interfaces/Identity";
import LogbookStateKeeper from "../shared/LogbookStateKeeper";
import {List, ListItem, ListItemText} from "@material-ui/core";
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

type Props={
    route:any
    logbookStateKeeper:LogbookStateKeeper
    identity:Identity
}
type State={
    currentLogBookEntry:LogbookEntry;
    previousLogbookHash:string;
    showInfo:boolean[];
}

export default class DetailLogView extends React.Component<Props, State> {

    state={
        showInfo:new Array(100).fill(false),
        currentLogBookEntry:this.props.logbookStateKeeper.CurrentSelectedLogs[0],
        previousLogbookHash:"",
    };

    imageRecordHasBeenLogged(log:Log, imageRecord:ImageRecord):boolean{
        // we might be displaying the most recent image record, in which case the root log will show it hasn't been logged yet
        return (log.currentDataMultiHash == imageRecord.currentMultiHash &&
                log.currentTransactionHash != "")
            || (log.currentDataMultiHash == imageRecord.rootMultiHash &&
                log.currentTransactionHash!= "")
    }



    parseAndDisplayMetadata(node:RevisionNode, index:number): JSX.Element{
        let metadataDictionary:{[key:string]:string} = {};

        if (!node.imageRecordIsBlank){
            if (this.imageRecordHasBeenLogged(node.log,node.imageRecord)) {
                metadataDictionary["Log Status"] = "Logged";
                metadataDictionary["File Name"] = node.imageRecord.filename;
            }
            else {
                metadataDictionary["Log Status"] = "Not Yet Logged";
            }
        }

        let i = 1;
        for (const corroLog of node.corroboratingLogs){
            // prettyPrint("corrolog:",corroLog);
            metadataDictionary[OrdinalSuffixOf(i) + " Corroborated"] =
                GetLocalTimeFromSeconds(corroLog.blockTimeOrLocalTime/1000);
            metadataDictionary[OrdinalSuffixOf(i) + " Corroborator"] = corroLog.loggingPublicKey==this.props.identity.PublicPGPKey ?
                "You" :
                KeysToNamesMap[corroLog.loggingPublicKey] ;
            i+=1;
        }
        if (node.corroboratingLogs.length==0){
            metadataDictionary["Corroborated"] = "0 times"
        }


        if (this.state.showInfo[index]) {
            if (!node.imageRecordIsBlank) {
                const imageMetadata = JSON.parse(node.imageRecord.metadataJSON);

                // we add all metadata except the above parsed stuff
                for (const key of Object.keys(imageMetadata)) {
                    if (key == LogMetadata.ImageDescription) {
                        const description = ImageRecord.GetExtraImageInformation(node.imageRecord);
                        metadataDictionary[key] = description ? description.Description : "none";
                        continue;
                    }
                    metadataDictionary[key] = imageMetadata[key];
                }
            }

            // image is not be paired to all non-head, non-root trunk logs, so the image is null
            // if (imageRecordHasBeenLogged || !imageRecord) {
            if (node.log.encryptedMetadataJson != "") {
                const encryptedMetadata = JSON.parse(new LogMetadata(
                    null, null, null,
                    node.log.encryptedMetadataJson,
                    this.props.identity.PrivatePGPKey).JsonData());

                if (!encryptedMetadata) {
                    metadataDictionary["On-Chain Encrypted Metadata"] = "Unable to Decrypt";
                } else {
                    for (const key of Object.keys(encryptedMetadata)) {
                        metadataDictionary[key] = encryptedMetadata[key];
                    }
                }
            }

            // get the other log key+values that aren't in the signed metadata (i.e. multihash, etc.)
            for (const key of Object.keys(node.log)) {
                //@ts-ignore
                const data = node.log[key] ? node.log[key].toString() : node.log[key]
                if (data != node.log.encryptedMetadataJson) {
                    metadataDictionary[key] = data;
                }
            }
        }


        let details = new Array<JSX.Element>();
        Object.keys(metadataDictionary).
        forEach(function eachKey(key)
        {
            details.push(<ListItemText key={key}> <Text style={{fontWeight:"bold"}}>{key}</Text>: {metadataDictionary[key]}</ListItemText>);
        });
        return <List>{details}</List>;
    }


  componentDidMount(): void {
      if (this.state.currentLogBookEntry.HeadLog.currentDataMultiHash != this.state.previousLogbookHash
      ) {
          this.setState({
              currentLogBookEntry: this.props.logbookStateKeeper.CurrentSelectedLogs[0],
              previousLogbookHash: this.props.logbookStateKeeper.CurrentSelectedLogs[0].HeadLog.currentDataMultiHash,
              });
      }

  }

  getTitle(node:RevisionNode, index:number):string{
      return "Log v" + index +" on "+ GetLocalTimeFromSeconds(node.log.blockTimeOrLocalTime)
  }


    render() {

        return (
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
                    return (<ListItem button={true}
                        onClick={()=>{
                            let prevInfo = this.state.showInfo;
                            prevInfo[index] = !prevInfo[index];
                            this.setState({showInfo:prevInfo})
                        }}
                        key={node.log.currentDataMultiHash + index}
                        title={this.getTitle(node,
                            this.state.currentLogBookEntry.OrderedRevisionsStartingAtHead.length - index)}
                        // containerStyle={styles.title}
                        // badge={{
                        //     value: node.corroboratingLogs.length, textStyle: {color: 'white'}, badgeStyle:{width:50}
                        // }}

                        >
                            <ListItemText primary={"hi"}>
                                {this.parseAndDisplayMetadata(node, index)}
                            </ListItemText>
                            {this.state.showInfo[index] ?
                                <ExpandLess/>
                                :
                                <ExpandMore/>
                            }


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
