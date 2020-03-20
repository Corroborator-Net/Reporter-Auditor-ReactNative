import React from "react";
import {StyleSheet, Image, ScrollView, View, Keyboard} from "react-native";
import {ImageRecord, LogbookEntry, LogbookStateKeeper, LogMetadata} from "../interfaces/Data";
import {Button, Input} from "react-native-elements";
import {LogManager} from "../shared/LogManager";
//@ts-ignore
import {piexif} from "piexifjs";
import {ImageDatabase} from "../interfaces/Storage";
import HashManager from "../shared/HashManager";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNFetchBlob from "rn-fetch-blob";
import {AppButtonTint} from "../utils/Constants";


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
        if (this.state.newImageDescription == ""){
            this.setState({
                saving:false
            });
            return
        }
        for (const log of this.props.logbookStateKeeper.CurrentSelectedLogs) {

            // I want image records with matching root hashes
            const imageRecordsWithMatchingRootHashes = log.imageRecords;
            // console.log("length:",imageRecordsWithMatchingRootHashes.length);
            // console.log("first:", imageRecordsWithMatchingRootHashes[0].metadata);
            const mostRecentImageRecord = imageRecordsWithMatchingRootHashes[imageRecordsWithMatchingRootHashes.length - 1];
            console.log("most recent", mostRecentImageRecord.metadata);
            const jpeg = `data:image/jpeg;base64,${mostRecentImageRecord.base64Data}`;
            // load the exif data for viewing
            const exifObj = piexif.load(jpeg);
            // for (const ifd in exifObj) {
            //     if (ifd == "thumbnail") {
            //         continue;
            //     }
            //     console.log("-" + ifd);
            //     for (var tag in exifObj[ifd]) {
            //
            //         console.log("  " + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
            //         console.log("ifd:", ifd, "tag:", tag)
            //
            //
            //     }
            // }

            // console.log("EDITING TAG");
            exifObj["0th"][270] = this.state.newImageDescription;

            // after editing the exif, dump it into a string
            const exifString = piexif.dump(exifObj);

            // OVERWRITE the string into the jpeg - insert is not properly named!
            const newJpeg = piexif.insert(exifString, jpeg);
            const newBase64Data = newJpeg.slice("data:image/jpeg;base64,".length);

            // TODO: let's get new gps coords so we know were the user edited the data
            const oldExif = JSON.parse(mostRecentImageRecord.metadata);
            const exif: { [name: string]: any } = {
                [LogMetadata.GPSLat]: oldExif[LogMetadata.GPSLat],
                [LogMetadata.GPSLong]: oldExif[LogMetadata.GPSLong],
                [LogMetadata.GPSAlt]: oldExif[LogMetadata.GPSAlt],
                [LogMetadata.GPSSpeed] : oldExif[LogMetadata.GPSSpeed],
                [LogMetadata.GPSAcc] :oldExif[LogMetadata.GPSAcc],
                [LogMetadata.ImageDescription]: exifObj["0th"][270],
            };

            const newHash = HashManager.GetHashSync(newBase64Data);
            if ( newHash == mostRecentImageRecord.currentMultiHash){
                console.log("data is unchanged");
                continue;
            }


            const time = new Date();
            const timestamp = "_EditedOn_D:" + time.toLocaleDateString().replace("/","_").replace("/","_")
                +"_T:" + time.toLocaleTimeString();

            const dirs = RNFetchBlob.fs.dirs;
            const temp = dirs.CacheDir;
            const fileName = log.RootLog.storageLocation.slice(log.Log.storageLocation.lastIndexOf("/") + 1);
            const newPath = temp + "/" + fileName.slice(0,fileName.length-4) + timestamp + ".jpg";
            // console.log("new storage location:",newPath);

            const newImageRecord = new ImageRecord(
                time,
                newPath,
                log.RootLog.dataMultiHash,
                newHash,
                newBase64Data,
                exif);


            if (imageRecordsWithMatchingRootHashes.length > 1) {
                // console.log("replacing previous head image record");
                // we have multiple image records. let's remove the current head then
                await this.props.imageDatabase.removeImageRecord(mostRecentImageRecord);
                console.log("deleted record, now adding the edited one");
                await this.props.imageDatabase.add(newImageRecord);

            } else {
                await this.props.imageDatabase.add(newImageRecord);
            }

        }
        this.setState({
            saving:false
        });

    }

    DisplayEditableMetadata(logs:LogbookEntry[]):Array<Element>{
        let details = new Array<Element>();

        let currentDescription = `Enter new description for the ${logs.length} images`;
        if (logs.length==1){
            // add one log specific UI here
            currentDescription = JSON.parse(logs[0].ImageRecord.metadata)[LogMetadata.ImageDescription];
            console.log("only one image's description: ", currentDescription);
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