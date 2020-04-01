import {Log, LogbookEntry} from "../interfaces/Data";
import React from "react";
import {Text} from "react-native-elements";
import {ImageBackground, StyleSheet, View} from "react-native";
import {CorroboratedUnsynced, LocalOnly, Synced} from "../shared/Constants";

type CellProps = {
    src: string;
    item:LogbookEntry;
    navigation:any;
    onSelectedOverlay:HTMLElement
}

type CellState = {
}

export default class LogCell extends React.PureComponent<CellProps,CellState> {

    render(){
        const shouldShowImage =  this.props.src.length > 50;
        return (
            <View
                style={{
                    backgroundColor: this.getColorForLog(this.props.item),
                    padding: 5,
                    margin: 2,
                    height:110,
                    width:110,
                    justifyContent:"center",
                    alignContent:"center",

                    }}
            >
                {shouldShowImage ?
                    <ImageBackground
                        source={{uri: this.props.src}}
                        resizeMethod={"resize"}
                        style={styles.image}
                    >
                        {this.props.onSelectedOverlay}
                    </ImageBackground>
                    :
                    <></>

                }
                {

                    shouldShowImage ?
                        <></>
                        :
                        <Text>
                            {
                                // TODO: see note in single logbook view about showing blocktimes instead of decrypting all logs' metadata
                                // decrypt the log metadata and show the user the date tag if no image is available
                                // new LogMetadata(
                                // null,
                                // null,
                                // null,
                                // this.props.item.Log.encryptedMetadataJson,
                                // [ReporterPEMKey.publicKey],
                                // ReporterPEMKey.privateKey).
                                // pubKeysToAESKeysToJSONDataMap[ReporterPEMKey.publicKey][LogMetadata.DateTag]
                            }
                        </Text>

                    }
            </View>
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
            // console.log("log has no transaction hash, checking for other signatures from corroborators");
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
        alignSelf:"center",
    },

    image:{
        width: 100,
        height: 100,
        alignSelf:"center",
    },

});