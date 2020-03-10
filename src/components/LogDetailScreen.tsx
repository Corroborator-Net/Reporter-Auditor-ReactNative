import React from "react";
import {View, Text, StyleSheet} from "react-native";
import {Log} from "../interfaces/Data";


type Props={
    route:any
}

export default class DetailsScreen extends React.Component<Props> {

    parseAndDisplayMetadata(log:Log):Array<Element>{
        let details = new Array<Element>();
        const obj = JSON.parse(log.signedMetadataJson)["0"];
        // add extra bits from the log
        obj["Hash"]=log.dataMultiHash;
        obj["Transaction Hash"]=log.transactionHash;

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
            <View style={styles.detailsList}>
                {this.parseAndDisplayMetadata(log)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
detailsList:{
    flex: 1,
    alignItems: 'flex-start',


},

});