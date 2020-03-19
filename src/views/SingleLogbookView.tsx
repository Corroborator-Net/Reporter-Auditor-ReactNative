import React from "react";
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity, View
} from "react-native";
import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {Log, LogbookStateKeeper} from "../interfaces/Data";
import LogCell from "../components/LogCell";
import {Button} from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import _ from 'lodash';
import {DetailLogViewName, EditLogsViewName} from "../utils/Constants";
import { LogManager} from "../shared/LogManager";

type State={
    logs:Log[]
    photos:Map<string, string>
    refreshing:boolean
    selectingMultiple:boolean
    currentlySelectedLogs:Log[]
    rerenderSelectedCells:boolean
}

type LogbookViewProps={
    logSource:LogbookDatabase;
    logbookStateKeeper:LogbookStateKeeper;
    imageSource:ImageDatabase;
    navigation: any;
}

export default class SingleLogbookView extends React.PureComponent<LogbookViewProps, State> {

    static LogsPerPage = 20;
    static ShouldUpdateLogbookView = false;
    previousLogLength = 0;
    previousLogbook = "";

    FlatList:any=null;
    state={
        logs:new Array<Log>(),
        photos:new Map<string, string>(),
        refreshing:false,
        selectingMultiple:false,
        currentlySelectedLogs:new Array<Log>(),
        rerenderSelectedCells:false
    };



    componentDidMount(): void {
        this.FlatList = React.createRef();
        this.getLogs();
        this.props.navigation.addListener('focus', this.onScreenFocus)

        this.props.navigation.setOptions({
            headerRight: () => (
                <View style={styles.buttonView}>
                <Button onPress={() => this.resyncSelectedLogs()}
                        title="Sync"
                        buttonStyle={{marginRight:10}}
                        icon={<Icon name={"sync"} size={25} color={"white"} style={{marginRight:7}} />}
                />
                    <Button onPress={() => this.onEditButtonPressed()}
                            title="Edit"
                            buttonStyle={{marginRight:10}}
                            icon={<Icon name={"pencil"} size={25} color={"white"} style={{marginRight:7}} />}
                    />
                </View>
            ),
        });
    }

    onEditButtonPressed(){
        this.props.logbookStateKeeper.CurrentSelectedLogs = this.state.currentlySelectedLogs;
        // clear the selection or not? Thinking not in case of user error/fat fingers
        if (this.state.currentlySelectedLogs.length==1){
            this.props.navigation.navigate(EditLogsViewName, {
                src: this.state.photos.get(this.state.currentlySelectedLogs[0].dataMultiHash)
            });
        }
        else{
            this.props.navigation.navigate(EditLogsViewName)
        }


    }


    resyncSelectedLogs(){
        console.log("resync!");

        // TODO: show user we're uploading the logs!
        LogManager.Instance.UploadEditedLogs(this.state.currentlySelectedLogs);
        this.setState({
            selectingMultiple:false,
            currentlySelectedLogs:new Array<Log>(),
            rerenderSelectedCells:!this.state.rerenderSelectedCells
        });
    }



    // TODO: maybe add a callback to the logbook state keeper interface?
    logbookChanged() : boolean{
        return this.previousLogbook != this.props.logbookStateKeeper.CurrentLogbook
    }


    onScreenFocus = () => {
        if (this.previousLogLength < this.state.logs.length ||
            (this.logbookChanged())
        ){
            console.log("refreshing!");
            this.getLogs();
        }
        else if(SingleLogbookView.ShouldUpdateLogbookView){
            this.getLogs();
            SingleLogbookView.ShouldUpdateLogbookView = false;
        }
        this.previousLogbook = this.props.logbookStateKeeper.CurrentLogbook;
    };

    //TODO: Shouldn't we be showing the image record's meta data anyways?
    // So they can see the extra goodies in the JPEG. So let's load the image metadata!
    // TODO: implement pages or infinite scroll
    async getLogs(){
        const currentLogbook=this.props.logbookStateKeeper.CurrentLogbook;
        console.log("loading logs for logbook: ", currentLogbook);
        // get all of our reporters' logs - this will either be local storage or blockchain storage
        let newMap = new Map<string, string>();
        //TODO: organize logs into groups by their root transaction hash or create data structure to organize
        // the logs and image records
        let logs = await this.props.logSource.getRecordsFor(currentLogbook);
        const photos = await this.props.imageSource.getImages(logs.slice(0,SingleLogbookView.LogsPerPage));
        photos.map((photo:string,i:number) => {
            newMap.set(logs[i].dataMultiHash, photo);
        });
        this.setState({
            logs:logs,
            photos:newMap,
        });
        this.previousLogLength = logs.length;
    }


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                        removeClippedSubviews={true}
                        ref={ (ref) => this.FlatList = ref }
                        initialNumToRender={8}
                        numColumns={2}
                        maxToRenderPerBatch={2}
                        data={this.state.logs}
                        contentContainerStyle={styles.list}
                        renderItem={({item}) =>
                            <TouchableOpacity
                                onPress={()=>{this.onSelectLog(item)}}
                                onLongPress={()=>{this.beginSelectingMultiple(item)}}
                            >
                            <LogCell
                                src= {`data:image/jpeg;base64,${this.state.photos.get(item.dataMultiHash)}`}
                                // {"data:image/jpeg;base64,"} // to test local-only storage on auditor side,
                                // don't pass an image
                                item={item}
                                navigation={this.props.navigation}
                                onSelectedOverlay={
                                    this.state.selectingMultiple?
                                        // we're in select multiple mode, show blank or checked circles
                                        _.includes(this.state.currentlySelectedLogs,item)?
                                            <Icon name={"check-circle-outline"} size={30} color={"black"} style={{
                                                marginLeft:75,
                                                backgroundColor:"white",
                                                borderRadius: 50,
                                            }}/>
                                        :
                                            <Icon name={"checkbox-blank-circle-outline"} size={30} color={"black"} style={{
                                                marginLeft:75,
                                                backgroundColor:"white",
                                                borderRadius: 50,
                                            }}/>
                                    // we're not in select multiple mode
                                    : <></>
                                }
                            />
                            </TouchableOpacity>
                        }
                        keyExtractor={item => item.dataMultiHash}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={() => this.getLogs()}/>
                        }
                        extraData={this.state}
                />
            </SafeAreaView>
        );
    }

    beginSelectingMultiple(log:Log){
        // const shouldSelectMultiple = ;
        this.setState({
            selectingMultiple:!this.state.selectingMultiple,
            rerenderSelectedCells:!this.state.rerenderSelectedCells,
            currentlySelectedLogs:new Array<Log>(),
        },
            ()=>{
                // if we're now selecting multiple logs, highlight the one we just pressed
            if (this.state.selectingMultiple){
                this.onSelectLog(log)
            }})
    }

    onSelectLog(log:Log){
        if (!this.state.selectingMultiple) {
            this.props.navigation.navigate(
                DetailLogViewName,
                {
                    log: JSON.stringify(log),
                    src: this.state.photos.get(log.dataMultiHash),
                });
            return
        }


        let currentlySelected = this.state.currentlySelectedLogs;

        if (_.includes(currentlySelected,log)){
            _.pull(currentlySelected,log);
        }
        else{
            currentlySelected.push(log);
        }
        this.setState({
            currentlySelectedLogs:currentlySelected,
            rerenderSelectedCells:!this.state.rerenderSelectedCells
        });
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 25,
    },
    list: {
        flexDirection: 'column',
        alignItems:"center",
    },
    buttonView:{
        flex: 1,
        flexDirection: 'row',
        alignItems:"center",
    }

});
