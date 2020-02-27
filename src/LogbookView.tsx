import React from "react";
import {Image, ScrollView, Text, View} from "react-native";
import {LogbookDatabase} from "./interfaces/Storage";
import {Log} from "./interfaces/Data";
import {LogManager} from "./LogManager";
import CameraRoll from "@react-native-community/cameraroll";


type State={
    logs:Log[]|null
    photos:any
}
type Props={
    logSource:LogbookDatabase;
    navigation:any;
}

export default class LogbookView extends React.PureComponent<Props, State> {

    state={
        logs:null,
        photos:null
    }

    componentDidMount(): void {
        this.getLogs();
        // this.props.navigation.addListener('willFocus', this.load);
    }

    load = () => {
        console.log("hi!")
    }



    async getLogs(){
        this.loadImagesFromCameraRoll();
        // get all of our reporters' logs
        const logs = await this.props.logSource.getAllRecords(LogManager.CurrentAddress);
        // const logs = await this.props.logSource.getRecordsFor("666");
        this.setState({
            logs:logs
        })

    }

    loadImagesFromCameraRoll = () => {
        CameraRoll.getPhotos({
            first: 5,
            assetType: 'Photos',
        })
            .then(r => {
                this.setState({ photos: r.edges },
                    this.listPhotos);
            })
            .catch((err) => {
                //Error Loading Images
            });
    };
    listPhotos(){
        //@ts-ignore
        this.state.photos.map((p, i) => {
            console.log(p.node.image.uri)
        });

    }


    render() {
        return (
            <ScrollView>
             { this.state.logs!=null && this.state.logs.map((log: Log) => {
                return (
                    <>
                    {/*{console.log("key is: " + i)}*/}
                    {/*{console.log("uri is: " + p.node.image.uri)}*/}
                    <Text style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }} key={log.dataMultiHash}>
                        {log.dataMultiHash}
                    </Text>
                    </>
                );
            })}
        </ScrollView>
        // {/*<ScrollView>*/}
        // {/*     { this.state.photos!=null && this.state.photos.map((p, i) => {*/}
        // {/*        return (*/}
        // {/*            <>*/}
        // {/*            {console.log("key is: " + i)}*/}
        // {/*            {console.log("uri is: " + p.node.image.uri)}*/}
        // {/*            <Image*/}
        // {/*                key={i}*/}
        // {/*                style={{*/}
        // {/*                    width: 300,*/}
        // {/*                    height: 100,*/}
        // {/*                }}*/}
        // {/*                source={{ uri: p.node.image.uri }}*/}
        // {/*            />*/}
        // {/*            </>*/}
        // {/*        );*/}
        // {/*    })}*/}
        // {/*</ScrollView>*/}
        );
    }

}
