import React from "react";
import {View, Text, StyleSheet, Image, ScrollView} from "react-native";
import {Log} from "../interfaces/Data";


type Props={
    route:any
}

export default class DetailsScreen extends React.Component<Props> {

    parseAndDisplayMetadata(log:Log):Array<Element>{
        let details = new Array<Element>();
        const obj = JSON.parse(log.signedMetadataJson)["0"];
        // TODO: just add all log data except the signedMetadataJson
        // obj["Hash"]=log.dataMultiHash;
        // obj["Transaction Hash"]=log.transactionHash;

        Object.keys(obj).
        forEach(function eachKey(key)
        {
            details.push(<Text key={key}> <Text style={{fontWeight:"bold"}}>{key}</Text>: {obj[key]}</Text>);
        });
        return details;
    }

    render() {
        const logString = this.props.route.params.log;
        const log:Log = JSON.parse(logString);
        return (
            <ScrollView>
                <Image
                    source={{uri: this.props.route.params.src}}
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