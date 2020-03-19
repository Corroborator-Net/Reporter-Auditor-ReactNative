import React from "react";
import {Text, StyleSheet, Image, ScrollView} from "react-native";
import {Log, LogbookEntry, LogbookStateKeeper} from "../interfaces/Data";
import {PrependJpegString} from "../utils/Constants";


type Props={
    route:any
    logbookStateKeeper:LogbookStateKeeper
}

export default class DetailLogView extends React.Component<Props> {

    parseAndDisplayMetadata(logbookEntry:LogbookEntry):Array<Element>{
        let details = new Array<Element>();
        // TODO: decrypt the signed metadata
        const obj = JSON.parse(logbookEntry.ImageRecord.metadata);

        // we add all metadata except the above parsed stuff which we'll have to decrypt!
        for (const key of Object.keys(logbookEntry.Log)){
            if (key != "signedMetadataJson"){
                //@ts-ignore
                obj[key] = logbookEntry.Log[key];
            }
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
                {this.parseAndDisplayMetadata(log)}
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