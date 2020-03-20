import React from "react";
import {Text, StyleSheet, Image, ScrollView, View} from "react-native";
import {ImageRecord, Log, LogbookEntry, LogbookStateKeeper} from "../interfaces/Data";
import {PrependJpegString} from "../utils/Constants";
import {ListItem} from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";


type Props={
    route:any
    logbookStateKeeper:LogbookStateKeeper
}
type State={
    currentLogEntryInformation:JSX.Element;
    rootLogEntryInformation:JSX.Element;
    showRootInfo:boolean;
    shotCurrentInfo:boolean;
}

export default class DetailLogView extends React.Component<Props, State> {

    state={
        showRootInfo:false,
        shotCurrentInfo:true,
        currentLogEntryInformation:<></>,
        rootLogEntryInformation:<></>,
    };

    parseAndDisplayMetadata(log:Log, imageRecord:ImageRecord): Array<JSX.Element>{
        let details = new Array<JSX.Element>();
        // TODO: decrypt the signed metadata
        const obj = JSON.parse(imageRecord.metadata);

        if (log.dataMultiHash== imageRecord.currentMultiHash) {
            // we add all metadata except the above parsed stuff which we'll have to decrypt!
            for (const key of Object.keys(log)) {
                if (key != "signedMetadataJson") {
                    // @ts-ignore
                    obj[key] = log[key];
                }
            }
        }
        else {
            obj["Log Status:"] = "Not Yet Logged"
        }

        Object.keys(obj).
        forEach(function eachKey(key)
        {
            details.push(<Text key={key}> <Text style={{fontWeight:"bold"}}>{key}</Text>: {obj[key]}</Text>);
        });
        return details;

    }

    render() {

        const log:LogbookEntry = this.props.logbookStateKeeper.CurrentSelectedLogs[0];

        return (
            <ScrollView>
                <Image
                    source={{uri: PrependJpegString(log.ImageRecord.base64Data)}}
                    resizeMethod={"resize"}
                    style={styles.image}
                />
                <ListItem
                    onPress={()=>this.setState({shotCurrentInfo:!this.state.shotCurrentInfo})}
                    title={"Most Recent Log Metadata"}
                    containerStyle={styles.title}
                    chevron={this.state.shotCurrentInfo ?
                        <Icon name={"chevron-down"} size={20} color={"black"}/>
                        :
                        <Icon name={"chevron-right"} size={20} color={"black"}/>
                    }
                >
                </ListItem>
                {this.state.shotCurrentInfo ? this.parseAndDisplayMetadata(log.Log, log.ImageRecord) : <></>}

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

                {this.state.showRootInfo ? this.parseAndDisplayMetadata(log.RootLog, log.RootImageRecord) : <></>}
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