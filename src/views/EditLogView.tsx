import React from "react";
import {StyleSheet, Image, ScrollView, View, Keyboard} from "react-native";
import {ImageDescription, ImageRecord, LogbookEntry, LogbookStateKeeper} from "../interfaces/Data";
import {Button, Input} from "react-native-elements";
import {LogManager} from "../shared/LogManager";
//@ts-ignore
import {piexif} from "piexifjs";
import {ImageDatabase} from "../interfaces/Storage";
import HashManager from "../shared/HashManager";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNFetchBlob from "rn-fetch-blob";
import {AppButtonTint, UserPreferenceKeys, waitMS} from "../utils/Constants";
import SingleLogbookView from "./SingleLogbookView";
import {LogMetadata} from "../shared/LogMetadata";
import NativeUserPreferences from "../native/NativeUserPreferences";


type Props={
    route:any
    logbookStateKeeper:LogbookStateKeeper
    logManager:LogManager
    imageDatabase:ImageDatabase
    navigation: any;
}

type State ={
    newImageDescription:string
    saving:boolean
}
export default class EditLogView extends React.Component<Props, State> {

    state = {
        newImageDescription:"",
        saving:false,
    };



    async saveEditedImageData(){
        // let the loading spinner start spinning
        await waitMS(500);
        if (this.state.newImageDescription != "") {
            const dirs = RNFetchBlob.fs.dirs;
            const temp = dirs.CacheDir;

            for (const log of this.props.logbookStateKeeper.CurrentSelectedLogs) {

                // TODO: let's get new gps coords so we know were the user edited the data
                // // TODO: allow user to change logbook
                const newBase64Data = log.ImageRecord.UpdateExifObject(this.state.newImageDescription).
                slice("data:image/jpeg;base64,".length);

                const newHash = HashManager.GetHashSync(newBase64Data);
                if (newHash == log.ImageRecord.currentMultiHash) {
                    console.log("data is unchanged");
                    continue;
                }


                const time = new Date();
                const timestamp = "_EditedOn_D:" + time.toLocaleDateString().replace("/", "_").replace("/", "_")
                    + "_T:" + time.toLocaleTimeString();


                // const fileName = log.RootLog.storageLocation.slice(log.RootLog.storageLocation.lastIndexOf("/") + 1);
                const newPath = temp + "/" + log.RootImageRecord.filename.slice(0, log.RootImageRecord.filename.length - 4) + timestamp + ".jpg";

                const newImageRecord = new ImageRecord(
                    time,
                    newPath,
                    log.RootLog.dataMultiHash,
                    newHash,
                    newBase64Data);


                if (log.imageRecords.length > 1) {
                    await this.props.imageDatabase.add(newImageRecord);

                } else {
                    await this.props.imageDatabase.add(newImageRecord);
                }

            }
        }
        SingleLogbookView.ShouldUpdateLogbookView=true;
        this.setState({
            saving:false
        });

    }



    DisplayEditableMetadata(logs:LogbookEntry[]):Array<Element>{
        let details = new Array<Element>();

        let currentDescription = `Enter new description for the ${logs.length} images`;
        if (logs.length==1){
            // add one log specific UI here
            console.log(JSON.parse(logs[0].ImageRecord.metadata)[LogMetadata.ImageDescription]);
            currentDescription = logs[0].ImageRecord.metadata//JSON.parse(logs[0].ImageRecord.metadata)[LogMetadata.ImageDescription];
            // console.log("only one image's description: ", currentDescription);
        }


        details.push(<Input
            key={currentDescription}
            placeholder={currentDescription}
            label={"Image Description"}
            onChangeText={(text => {
                this.setState({
                    newImageDescription:text
                });
            })}/>);

        return details;
    }


    render() {
            const logs = this.props.logbookStateKeeper.CurrentSelectedLogs;

        return (
            <>
            <ScrollView>
                {logs.length==1 ?
                    <Image
                        source={{uri: `data:image/jpeg;base64,${logs[0].ImageRecord.base64Data}`}}
                        resizeMethod={"resize"}
                        style={styles.image}
                    />
                :
                    <View style={{flex:1,flexDirection:"row", height:300,  justifyContent:"flex-start"}}>
                        {logs.map((log)=>{
                            return (<Image
                                source={{uri: `data:image/jpeg;base64,${log.ImageRecord.base64Data}`}}
                                resizeMethod={"resize"}
                                key={log.Log.dataMultiHash}
                                style={{width:this.getWidth(logs.length),
                                    marginHorizontal:this.getMargin(logs.length),
                                    resizeMode:"contain",
                                }}
                            />)
                        })}
                    </View>
                }
        {this.DisplayEditableMetadata(logs)}

        </ScrollView>
                <View style={{
                    position:"absolute",
                    bottom:10,
                    right:10,
                }}>
                    <Button
                        containerStyle={{
                            alignSelf:"flex-end",
                            justifyContent: 'center',
                            width: 85,
                            bottom: 0,
                            right: 10,
                            height: 85,
                            backgroundColor: AppButtonTint,
                            borderRadius: 100,
                        }}
                        style={{
                            height: 100,
                            width: 100,
                            borderRadius: 100,

                        }}
                        type={"clear"}
                        title={"save"}
                        titleStyle={{color:"white"}}
                        onPress={() =>{
                            Keyboard.dismiss();
                            this.setState({
                                saving:true
                            },
                            this.saveEditedImageData)
                        }}
                        loading={this.state.saving}
                        loadingProps={{color:"white", size:"large"}}
                        icon={<Icon name={"content-save-outline"} size={30} color={"white"} style={{}}/>
                        }
                    />
                </View>
                </>

    );


    }

    getMargin(length:number):number{
        if (length<breakPoint){
            return 0;
        }
        const margin = -((360/breakPoint)*(length-breakPoint))/(length);
        return margin/2;
    }

    getWidth(length:number):number{
        if (length>breakPoint){
            return 360/breakPoint;
        }
        return 360/length;
    }
}

const breakPoint=3;
const styles = StyleSheet.create({
    image:{
        resizeMode:"contain",
        height: 300,
        margin:10
    },
    images:{
        resizeMode:"contain",
    },
});