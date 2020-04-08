import { LogbookEntry} from "../interfaces/Data";
import React from "react";
import {Image, Text} from "react-native-elements";
import {ImageBackground, StyleSheet, TouchableOpacity, View} from "react-native";
import {CorroboratedUnsynced, GetLocalTimeFromSeconds, LocalOnly, Synced} from "../shared/Constants";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";


type CellProps = {
    src: string;
    item:LogbookEntry;
    onSelectLog:any,
    beginSelectingMultiple:any
    selectingMultiple:boolean
}

type CellState = {
    selected:boolean
}





export default class LogCell extends React.PureComponent<CellProps,CellState> {

    state={
        selected:false
    };

    componentDidUpdate(prevProps: Readonly<CellProps>, prevState: Readonly<CellState>, snapshot?: any): void {
        if (!prevProps.selectingMultiple){
            this.setState({selected:false})
        }
    }


    render(){
        const shouldShowImage =  this.props.src.length > 50;

        return (
            <TouchableOpacity
                onPress={() => {
                    this.props.onSelectLog(this.props.item);
                    if (this.props.selectingMultiple){
                        this.setState({selected:!this.state.selected})
                    }
                }}
                onLongPress={() => {
                    this.props.beginSelectingMultiple(this.props.item);
                    this.setState({selected:this.props.selectingMultiple})
                }}
            >
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
                        {/*TODO: check if selecting multiple has changed, if so set our state.selected to false*/}
                        {this.props.selectingMultiple ?
                             this.state.selected ?

                            <Icon name={"check-circle-outline"} size={30} color={"black"} style={{
                                margin: 5,
                                width: 30,
                                backgroundColor: "white",
                                borderRadius: 50,
                            }}/>
                            :
                            <Icon name={"checkbox-blank-circle-outline"} size={30} color={"black"} style={{
                                margin: 5,
                                width: 30,
                                backgroundColor: "white",
                                borderRadius: 50,
                            }}/>
                            : <></>
                        }
                        {/* check if head log is corroborated*/}
                        {this.props.item.OrderedRevisionsStartingAtHead[0].corroboratingLogs.length>0 ?
                            <Image
                                source={require("../assets/cloud-sync.png") }
                                containerStyle={{
                                    width: 30,
                                    height: 30,
                                    right:5,
                                    bottom:5,
                                    position:"absolute",
                                }}
                            />
                            :
                            <Image
                                source={require("../assets/cloud-none.png") }
                                containerStyle={{
                                    width: 30,
                                    height: 30,
                                    right:5,
                                    bottom:5,
                                    position:"absolute",
                                }}
                            />

                        }
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
                                "Log on " +
                                GetLocalTimeFromSeconds(this.props.item.HeadLog.blockTimeOrLocalTime)
                            }
                        </Text>

                    }
            </View>
            </TouchableOpacity>

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
            // const trueLog = Object.setPrototypeOf(log.HeadLog, Log.prototype);
            // const reporterToMetadataMap = trueLog.getTimestampsMappedToReporterKeys();
            // if (reporterToMetadataMap.size<=1){
            //     return LocalOnly;
            // }
            // else{
                // we have multiple signed metadata records
                return LocalOnly;
            // }
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