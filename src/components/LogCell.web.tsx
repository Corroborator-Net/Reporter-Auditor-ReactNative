import { LogbookEntry} from "../interfaces/Data";
import React from "react";
//@ts-ignore
import Icon from 'react-web-vector-icons';
import {Image, Text} from "react-native";
import {ImageBackground, StyleSheet, TouchableOpacity, View} from "react-native";
import {GetLocalTimeFromSeconds, resetOrientation} from "../shared/Constants";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";


type CellProps = {
    src: string;
    item:LogbookEntry;
    onSelectLog:any,
    beginSelectingMultiple:any
    selectingMultiple:boolean
}

type CellState = {
    selected:boolean
    img:string
}





export default class LogCell extends React.PureComponent<CellProps,CellState> {

    state={
        selected:false,
        img:this.props.src
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
                    backgroundColor: this.props.item.GetColorForBorder(),
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
                                // containerStyle={{
                                //     width: 30,
                                //     height: 30,
                                //     right:5,
                                //     bottom:5,
                                //     position:"absolute",
                                // }}
                            />
                            :
                            <Image
                                source={require("../assets/cloud-none.png") }
                                // containerStyle={{
                                //     width: 30,
                                //     height: 30,
                                //     right:5,
                                //     bottom:5,
                                //     position:"absolute",
                                // }}
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
                                GetLocalTimeFromSeconds(this.props.item.HeadLog.blockTimeOrLocalTime/1000)
                            }
                        </Text>

                    }
            </View>
            </TouchableOpacity>

        );
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
