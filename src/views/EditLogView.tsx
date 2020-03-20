import React from "react";
import {StyleSheet, Image, ScrollView} from "react-native";
import {ImageRecord, LogbookEntry, LogbookStateKeeper, LogMetadata} from "../interfaces/Data";
import {Button, Input} from "react-native-elements";
import {LogManager} from "../shared/LogManager";
//@ts-ignore
import {piexif} from "piexifjs";
import {ImageDatabase} from "../interfaces/Storage";
import HashManager from "../shared/HashManager";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNFetchBlob from "rn-fetch-blob";


type Props={
    route:any
    logbookStateKeeper:LogbookStateKeeper
    logManager:LogManager
    imageDatabase:ImageDatabase
    navigation: any;
}

type State ={
    newImageDescription:string
}
export default class EditLogView extends React.Component<Props, State> {

    state = {
        newImageDescription:""
    };

    componentDidMount(): void {

        this.props.navigation.setOptions({
            headerRight: () => (
                    <Button onPress={() => this.saveEditedImageData()}
                            title="Save Changes"
                            buttonStyle={{marginRight:10}}
                            icon={<Icon name={"content-save-outline"} size={25} color={"white"} style={{marginRight:7}} />}
                    />
            ),
        });
    }

    async saveEditedImageData(){

        for (const log of this.props.logbookStateKeeper.CurrentSelectedLogs) {

            // I want image records with matching root hashes
            const imageRecordsWithMatchingRootHashes = log.imageRecords;
            console.log("length:",imageRecordsWithMatchingRootHashes.length);
            console.log("first:", imageRecordsWithMatchingRootHashes[0].metadata);
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

            console.log("EDITING TAG");
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
            console.log("we have the same data: ", newHash == mostRecentImageRecord.currentMultiHash);

            const time = new Date();
            const timestamp = "_EditedOn_D:" + time.toLocaleDateString().replace("/","_").replace("/","_")
                +"_T:" + time.toLocaleTimeString();

            const dirs = RNFetchBlob.fs.dirs;
            const temp = dirs.CacheDir;
            const fileName = log.RootLog.storageLocation.slice(log.Log.storageLocation.lastIndexOf("/") + 1);
            const newPath = temp + "/" + fileName.slice(0,fileName.length-4) + timestamp + ".jpg";
            console.log("new storage location:",newPath);

            const newImageRecord = new ImageRecord(
                time,
                newPath,
                log.RootLog.dataMultiHash,
                newHash,
                newBase64Data,
                exif);


            if (imageRecordsWithMatchingRootHashes.length > 1) {
                console.log("replacing previous head image record");
                // we have multiple image records. let's remove the current head then
                this.props.imageDatabase.removeImageRecord(mostRecentImageRecord).then(
                    (response) => {
                        console.log("deleted record, now adding the edited one");
                        this.props.imageDatabase.add(newImageRecord);
                    }
                )
            } else {
                this.props.imageDatabase.add(newImageRecord);
            }

        }


    }


    // TODO: allow editing multiple logs' metadata at once
    parseAndDisplayMetadata(logs:LogbookEntry[]):Array<Element>{
        let details = new Array<Element>();

        if (this.props.logbookStateKeeper.CurrentSelectedLogs.length<2){
            // add one log specific UI here
            details.push(<Input
                key={"Enter a new image description"}
            placeholder={"Enter a new image description"}
                onChangeText={(text => {
                this.setState({
                    newImageDescription:text
                });
            })}/>);
            return details;
        }


        details.push(<Input></Input>);

        return details;
    }

    render() {

        return (
            <ScrollView>
                {this.props.route.params ?
                    <Image
                        source={{uri: `data:image/jpeg;base64,${this.props.route.params.src}`}}
                        resizeMethod={"resize"}
                        style={styles.image}
                    />
                :
                    <></>
                }
        {this.parseAndDisplayMetadata(this.props.logbookStateKeeper.CurrentSelectedLogs)}
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
});