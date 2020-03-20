import React from "react";
import {
    FlatList,
    RefreshControl,
    SafeAreaView, ScrollView,
    StyleSheet,
    TouchableOpacity, View
} from "react-native";
import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {LogbookEntry, LogbookStateKeeper} from "../interfaces/Data";
import LogCell from "../components/LogCell";
import {Button} from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import _ from 'lodash';
import {AppButtonTint, DetailLogViewName, EditLogsViewName, PrependJpegString, waitMS} from "../utils/Constants";
import { LogManager} from "../shared/LogManager";

type State={
    logbookEntries:LogbookEntry[]
    refreshing:boolean
    selectingMultiple:boolean
    currentlySelectedLogs:LogbookEntry[]
    rerenderSelectedCells:boolean
    currentPage:number
    showingOptionsButton:boolean

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
    previousLogbook = "";

    FlatList:any=null;
    state={
        logbookEntries:new Array<LogbookEntry>(),
        refreshing:false,
        selectingMultiple:false,
        currentlySelectedLogs:new Array<LogbookEntry>(),
        rerenderSelectedCells:false,
        currentPage:0,
        showingOptionsButton:false,
    };



    componentDidMount(): void {
        this.FlatList = React.createRef();
        this.getLogs();
        this.props.navigation.addListener('focus', this.onScreenFocus);
    }



    onEditButtonPressed(){
        this.props.logbookStateKeeper.CurrentSelectedLogs = this.state.currentlySelectedLogs;
        // clear the selection or not? Thinking not in case of user error/fat fingers
        if (this.state.currentlySelectedLogs.length==1){
            this.props.navigation.navigate(EditLogsViewName, {
                src: this.state.currentlySelectedLogs[0].ImageRecord.base64Data
            });
        }
        else{
            this.props.navigation.navigate(EditLogsViewName)
        }


    }


    async resyncSelectedLogs(){
        console.log("resync!");

        this.setState({
            selectingMultiple:false,
            currentlySelectedLogs:new Array<LogbookEntry>(),
            refreshing:true,
        });
        // TODO: show user we're uploading the logs!
        LogManager.Instance.UploadEditedLogs(this.state.currentlySelectedLogs).then(async ()=>{
           while (LogManager.Instance.syncingLogs){
               await waitMS(50);
           }
            this.setState({
                rerenderSelectedCells:!this.state.rerenderSelectedCells,
                refreshing:false,
            });
        });

    }



    // TODO: maybe add a callback to the logbook state keeper interface?
    logbookChanged() : boolean{
        return this.previousLogbook != this.props.logbookStateKeeper.CurrentLogbook
    }


    onScreenFocus = () => {
        console.log("should update:",SingleLogbookView.ShouldUpdateLogbookView);

        if (this.logbookChanged() && !this.state.refreshing) {
            console.log((this.logbookChanged() && !this.state.refreshing));
            console.log("refreshing!");
            this.getLogs();
        }
        else if(SingleLogbookView.ShouldUpdateLogbookView){
            this.getLogs();
            SingleLogbookView.ShouldUpdateLogbookView = false;
        }
    };


    // TODO: implement pages or infinite scroll
    async getLogs(){

        this.previousLogbook = this.props.logbookStateKeeper.CurrentLogbook;
        this.setState({
            refreshing:true
        });

        const currentLogbook=this.props.logbookStateKeeper.CurrentLogbook;
        console.log("loading logs for logbook: ", currentLogbook);
        // get all of our reporters' logs - this will either be local storage or blockchain storage
        let allLogs = await this.props.logSource.getRecordsFor(currentLogbook);


        // we only want the ROOT logs
        const rootLogs = (allLogs.filter(log=>log.rootTransactionHash == log.currentTransactionHash)).
        slice(this.state.currentPage, SingleLogbookView.LogsPerPage);
        let logbookEntries = new Array<LogbookEntry>();

        for (const log of rootLogs){
            // Get all records with the same root hash
            const records = await this.props.imageSource.getImageRecordsWithMatchingRootHash(log.dataMultiHash);
            const logbookEntry = new LogbookEntry(log, allLogs, records);
            logbookEntries.push(logbookEntry);
        }

        this.setState({
            logbookEntries:logbookEntries,
            refreshing:false,
        });
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
                        data={this.state.logbookEntries}
                        contentContainerStyle={styles.list}
                        renderItem={({item}) =>
                            <TouchableOpacity
                                onPress={()=>{this.onSelectLog(item)}}
                                onLongPress={()=>{this.beginSelectingMultiple(item)}}
                            >
                            <LogCell
                                src= {PrependJpegString(item.ImageRecord.base64Data)}
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
                        keyExtractor={item => item.Log.dataMultiHash}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={()=>this.getLogs()}/>
                        }
                        extraData={this.state}
                />

                {
                    this.state.selectingMultiple ?
                        this.OptionsButton()
                    :
                        <></>
                }
            </SafeAreaView>
        );
    }

    beginSelectingMultiple(log:LogbookEntry){
        // const shouldSelectMultiple = ;
        this.setState({
            showingOptionsButton:false,
            selectingMultiple:!this.state.selectingMultiple,
            rerenderSelectedCells:!this.state.rerenderSelectedCells,
            currentlySelectedLogs:new Array<LogbookEntry>(),
        },
            ()=>{
                // if we're now selecting multiple logs, highlight the one we just pressed
            if (this.state.selectingMultiple){
                this.onSelectLog(log)
            }
            });

    }

    onSelectLog(log:LogbookEntry){
        if (!this.state.selectingMultiple) {
            this.props.logbookStateKeeper.CurrentSelectedLogs = [log]
            this.props.navigation.navigate(DetailLogViewName);
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

    OptionsButton() {
        return (
            <View >
                {this.state.showingOptionsButton ?

                <ScrollView style={styles.buttonList}>
                        <>
                            <Button onPress={() => this.resyncSelectedLogs()}
                                    containerStyle={styles.buttonContainer}
                                    style={styles.button}
                                    type={"outline"}
                                    title="Sync"
                                    titleStyle={{color:AppButtonTint}}
                                    buttonStyle={{marginRight: 10}}
                                    icon={<Icon name={"sync"} size={25} color={AppButtonTint} style={{marginRight: 7}}/>}
                            />
                            < Button onPress={() => this.onEditButtonPressed()}
                                     containerStyle={styles.buttonContainer}
                                     style={styles.button}
                                     type={"outline"}
                                    titleStyle={{color:AppButtonTint}}
                                     title="Edit"
                                     buttonStyle={{marginRight: 10}}
                                     icon={<Icon name={"pencil"} size={25} color={AppButtonTint} style={{marginRight: 7}}/>}
                            />
                        </>

                </ScrollView>
                    : <></>
                }

                <Button
                    containerStyle={{
                        alignSelf:"flex-end",
                        justifyContent: 'center',
                        width: 85,
                        bottom: 10,
                        right: 10,
                        height: 85,
                        backgroundColor: 'white',
                        borderRadius: 100,
                    }}
                    style={{
                        height: 100,
                        width: 100,
                        borderRadius: 100,

                    }}
                    type={"clear"}
                    onPress={() => {
                        this.setState({
                            showingOptionsButton:!this.state.showingOptionsButton
                        })}}
                    icon={<Icon name={"dots-horizontal"} size={20} color={AppButtonTint}/>}
                >


                </Button>

            </View>
        )
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
    buttonList:{
        padding:10,
        marginLeft:20,
        width:150,
        zIndex:100,
        backgroundColor:"white",
        borderColor:"grey",
        borderRadius:10,
        alignSelf:"flex-end",
    },
    buttonContainer:{
        margin:6,
    },
    button:{
        width:100,
        height:100,
    }

});
