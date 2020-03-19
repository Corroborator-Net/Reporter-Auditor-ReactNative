import {Log, LogbookEntry, LogMetadata} from "../interfaces/Data";
import React from "react";
import {ListItem} from "react-native-elements";
import {ImageBackground, StyleSheet} from "react-native";
import {CorroboratedUnsynced, LocalOnly, Synced} from "../utils/Constants";

type CellProps = {
    src: string;
    item:LogbookEntry;
    navigation:any;
    onSelectedOverlay:HTMLElement
}

type CellState = {
}

export default class LogCell extends React.Component<CellProps,CellState> {


    render(){
        return (
            <ListItem
                style={{
                    backgroundColor: this.getColorForLog(this.props.item),
                    padding: 5,
                    margin: 2,
                    maxHeight:150,
                    width:150,
                }}
                // onPress={this.props.onPress}
                // TODO: must decrypt these
                title={ this.props.src.length < 50 ?
                    JSON.parse(this.props.item.Log.signedMetadataJson)["0"][LogMetadata.DateTag]
                    :
                    ""
                }
                titleStyle={styles.title}
                leftIcon={
                    this.props.src.length < 50 ?
                        <></>
                        :
                        <ImageBackground
                            source={{uri: this.props.src}}
                            resizeMethod={"resize"}
                            style={styles.image}
                        >
                            {this.props.onSelectedOverlay}
                        </ImageBackground>
                }
            />
        );
    }



    getColorForLog(log:LogbookEntry):string{
        // Hash status:
        // green: the log has a transaction hash, its data is on chain
        // yellow: the metadata has multiple signatures
        // orange: the log exists, has been saved

        // Data status:
        // solo icon: the data is local only
        // network icon: the data is backed up
        // still unpublished? check for corroborations

        if (!log.IsImageRecordSynced()){
            console.log("log has no transaction hash, checking for other signatures from corroborators");
            const trueLog = Object.setPrototypeOf(log.Log, Log.prototype);
            const reporterToMetadataMap = trueLog.getTimestampsMappedToReporterKeys();
            if (reporterToMetadataMap.size<=1){
                return LocalOnly;
            }
            else{
                // we have multiple signed metadata records
                return CorroboratedUnsynced;
            }
        }

        return Synced;
    }
}


const styles = StyleSheet.create({
    title: {
        fontSize: 15,
        // flex:1,
        // flexWrap: 'wrap',
        alignSelf:"center",
    },

    image:{
        width: 105,
        height: 100,
    },

});