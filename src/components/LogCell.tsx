import {Log, LogMetadata} from "../interfaces/Data";
import React from "react";
import {ListItem} from "react-native-elements";
import {Image, StyleSheet} from "react-native";
import {CorroboratedUnsynced, DetailsScreenName, LocalOnly, Synced} from "../utils/Constants";

type CellProps = {
    src: string;
    item:Log;
    navigation:any;
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
                onPress={(event => {this.props.navigation.navigate
                (DetailsScreenName, {log:JSON.stringify(this.props.item), src:this.props.src})})
                }
                // TODO: must decrypt these
                title={ this.props.src.length < 50 ?
                    JSON.parse(this.props.item.signedMetadataJson)["0"][LogMetadata.DateTag]
                    :
                    ""
                }
                titleStyle={styles.title}
                leftIcon={
                    this.props.src.length < 50 ?
                        <></>
                        :
                        <Image
                            source={{uri: this.props.src}}
                            resizeMethod={"resize"}
                            style={styles.image}
                        />
                }
            />
        );
    }



    getColorForLog(log:Log):string{
        // Hash status:
        // green: the log has a transaction hash, its data is on chain
        // yellow: the metadata has multiple signatures
        // orange: the log exists, has been saved

        // Data status:
        // solo icon: the data is local only
        // network icon: the data is backed up
        if (log.transactionHash.length<=1){
            console.log("log has no transaction hash, checking for other signatures from corroborators");
            const trueLog = Object.setPrototypeOf(log, Log.prototype);
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