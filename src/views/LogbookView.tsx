import React from "react";
import {FlatList, Image, RefreshControl, SafeAreaView, StyleSheet, Text, View} from "react-native";
import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {Log, LogMetadata} from "../interfaces/Data";
import {requestStoragePermission, requestWritePermission} from "../utils/RequestPermissions";
import {NativeAtraManager} from "../NativeAtraManager";


type State={
    logs:Log[]
    photos:any
    refreshing:boolean
}
type Props={
    logSource:LogbookDatabase;
    imageSource:ImageDatabase;
    navigation:any;
}

export default class LogbookView extends React.PureComponent<Props, State> {

    // AUDTIOR TODO: The user will input this for the auditor side
    static DefaultLogAddress = NativeAtraManager.firstTableId;
    static ShouldUpdateLogbookView = false;
    previousLogLength = 0;
    FlatList:any=null;
    state={
        logs:new Array<Log>(),
        photos:new Map<string, string>(),
        refreshing:false
    };

    // TODO: move this outside of this view to the app with a trivial read/write to prompt user
    async getPermission(){
        await requestStoragePermission();
        await requestWritePermission();
    }


    componentDidMount(): void {
        this.FlatList = React.createRef();
        this.getPermission();
        this.getLogs();
        this.props.navigation.addListener('focus', this.onScreenFocus)
    }


    onScreenFocus = () => {
        if (this.previousLogLength < this.state.logs.length){
            console.log("refreshing!");
            this.getLogs();
        }
        else if(LogbookView.ShouldUpdateLogbookView){
            this.getLogs();
            LogbookView.ShouldUpdateLogbookView = false;
        }
    };


    async getLogs(){
        // get all of our reporters' logs - this will either be local storage or blockchain storage
        let newMap = new Map<string, string>();
        let logs = await this.props.logSource.getRecordsFor(LogbookView.DefaultLogAddress);

        if (logs.length<1){
            return;
        }

        const photos = await this.props.imageSource.getImages(logs.slice(0,20));
        photos.map((photo:string,i:number) => {
            newMap.set(logs[i].dataMultiHash, photo);
        });
        this.setState({
            logs:logs,
            photos:newMap,
        });
        this.previousLogLength = logs.length;
    }

/// scroll to top, and show refresh at the same time
    scrollToTopAndRefresh() {
        this.FlatList.scrollToOffset({x: 0, y: 0, animated: true});
        this.setState({
            refreshing: true,
        }, () => {
            this.refresh();
        });
    }

    refresh() {
        this.getLogs();
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.state.logs.length != 0 ?
                    <FlatList
                        removeClippedSubviews={true}
                        ref={ (ref) => this.FlatList = ref }
                        data={this.state.logs}
                        renderItem={({item}) =>
                            <LogRowCell
                            src={ `data:image/jpeg;base64,${this.state.photos.get(item.dataMultiHash)}`}
                            item={item}
                            />
                        }
                        keyExtractor={item => item.dataMultiHash}
                        refreshControl={
                            <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={() => this.refresh()}
                            />
                        }
                    />
                    :
                    <></>
                }
            </SafeAreaView>
        );
    }

// Hash status:
// green: the log has a transaction hash, its data is on chain
// yellow: the metadata has multiple signatures
// orange: the log exists, has been saved

// Data status:
// solo icon: the data is local only
// network icon: the data is backed up


}

class LogRowCell extends React.Component<{ src: string, item:Log }> {
    render() {
        let {src, item} = this.props;
        return (
            <View style={{
                backgroundColor: this.getColorForLog(item),
                padding: 20,
                marginVertical: 8,
                marginHorizontal: 16,
                flexDirection: 'row'}}
            >
                <Image source={{uri: src}} style={{
                    width: 50,
                    height: 50,
                }}/>
                <Text style={styles.title}>{item.dataMultiHash.slice(0,5) + "..." +
                item.dataMultiHash.slice(item.dataMultiHash.length-5,item.dataMultiHash.length)}</Text>
                <Text style={styles.title}>{JSON.parse(item.signedMetadataJson)["0"][LogMetadata.DateTag]} </Text>
            </View>
        );
    }
    getColorForLog(log:Log):string{
        if (log.transactionHash.length<=1){
            console.log("log has no transaction hash, checking for other signatures from corroborators");
            const trueLog = Object.setPrototypeOf(log, Log.prototype);
            const reporterToMetadataMap = trueLog.getTimestampsMappedToReporterKeys();
            if (reporterToMetadataMap.size<=1){
                return 'orange';
            }
            else{
                // we have multiple signed metadata records
                return 'yellow';
            }
        }

        return 'green';
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
    },

    title: {
        fontSize: 13,
        paddingLeft:5,
        flex:1,
        flexWrap: 'wrap',
        alignSelf: "center",

    },

});
