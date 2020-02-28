import React from "react";
import {Image, ScrollView, Text, View} from "react-native";
import {LogbookDatabase} from "./interfaces/Storage";
import {Log} from "./interfaces/Data";
import {LogManager} from "./LogManager";
import ImageManager from "./ImageManager";
import {requestStoragePermission, requestWritePermission} from "./RequestPermissions";


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
    };

    async getPermission(){
        await requestStoragePermission();
        await requestWritePermission();
    }

    componentDidMount(): void {
       this.getPermission();
        this.props.navigation.addListener('focus', this.onScreenFocus)
    }

    onScreenFocus = () => {
        this.getLogs();
    };


    async getLogs(){
        console.log("getlogs!");
        // get all of our reporters' logs
        const logs = await this.props.logSource.getAllRecords(LogManager.CurrentAddress);
        const photos = await ImageManager.LoadImagesFromCameraRoll(10);
        this.setState({
            logs:logs,
            photos:photos,
        })
    }




    render() {
        return (
            <ScrollView>
             { this.state.logs!=null && this.state.photos!=null && this.state.logs.map((log: Log, i:number) => {
                return (
                    <View key={log.dataMultiHash}>
                        {this.state.photos[i] != null ?
                    <Image
                        style={{
                            width: 100,
                            height: 100,
                        }}
                        source={{ uri:  this.state.photos[i].node.image.uri}}
                    />
                    :
                    <></>
                        }
                    <Text style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }} >
                        {log.dataMultiHash}
                    </Text>
                        <Text style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }} >
                            {log.location}
                        </Text>
                    </View>
                );
            })}
        </ScrollView>

        );
    }

}
