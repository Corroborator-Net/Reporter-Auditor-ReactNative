import React from "react";
import {Image, ScrollView, Text, View} from "react-native";
import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {ImageRecord, Log} from "../interfaces/Data";
import {LogManager} from "../LogManager";
import {requestStoragePermission, requestWritePermission} from "../utils/RequestPermissions";


type State={
    logs:Log[]
    photos:any
}
type Props={
    logSource:LogbookDatabase;
    imageSource:ImageDatabase;
    navigation:any;
}

export default class LogbookView extends React.PureComponent<Props, State> {

    state={
        logs:new Array<Log>(),
        photos:new Array<ImageRecord>()
    };

    async getPermission(){
        await requestStoragePermission();
        await requestWritePermission();
    }

    componentDidMount(): void {
        this.getPermission();
        this.getLogs();
        this.props.navigation.addListener('focus', this.onScreenFocus)
    }

    onScreenFocus = () => {
        this.getLogs();
    };


    async getLogs(){
        // get all of our reporters' logs - this will either be local storage or blockchain storage
        const logs = await this.props.logSource.getAllRecords(LogManager.CurrentAddress);
        const photos = await this.props.imageSource.getImages(logs.slice(0,10));
        this.setState({
            logs:logs,
            photos:photos,
        })
    }


    render() {
        return (
            <ScrollView>
                { this.state.logs.length!=0  && this.state.logs.map((log: Log, i:number) => {
                // @ts-ignore
                 return (
                    <View key={log.dataMultiHash}>
                        {this.state.photos.length > i ?
                    <Image

                        style={{
                            width: 100,
                            height: 100,
                        }}
                        source={{ uri:  `data:image/jpeg;base64,${this.state.photos[i].thumbnail}` }}
                    />
                    :
                    <></>
                        }
                    <Text style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }} >
                        {log.dataMultiHash}
                        {/*{console.log(this.state.photos[i].thumbnail)}*/}
                    </Text>
                        <Text style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }} >
                            {}
                        </Text>
                    </View>
                );
            })}
        </ScrollView>

        );
    }

}
