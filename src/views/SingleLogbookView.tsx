import React from "react";
import {
    Dimensions,
    FlatList,
    RefreshControl,
    SafeAreaView, ScrollView,
    StyleSheet,
    TouchableOpacity, View
} from "react-native";
import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {LogbookEntry, LogbookStateKeeper} from "../interfaces/Data";
import LogCell from "../components/LogCell";
import {Button, SearchBar} from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import _ from 'lodash';
import {AppButtonTint, DetailLogViewName, EditLogsViewName, PrependJpegString, waitMS} from "../utils/Constants";
import { LogManager} from "../shared/LogManager";

type State={
    logbookEntries:LogbookEntry[]
    filteredLogbookEntries:LogbookEntry[]
    refreshing:boolean
    selectingMultiple:boolean
    currentlySelectedLogs:LogbookEntry[]
    rerenderSelectedCells:boolean
    currentPage:number
    showingOptionsButton:boolean
    searchText:string
}

type LogbookViewProps={
    logSource:LogbookDatabase;
    logbookStateKeeper:LogbookStateKeeper;
    imageSource:ImageDatabase;
    navigation: any;
    route:any;
}

export default class SingleLogbookView extends React.PureComponent<LogbookViewProps, State> {

    static LogsPerPage = 20;
    static ShouldUpdateLogbookView = false;
    previousLogbook = "";

    FlatList:any=null;
    state={
        logbookEntries:new Array<LogbookEntry>(),
        filteredLogbookEntries:new Array<LogbookEntry>(),
        refreshing:false,
        selectingMultiple:false,
        currentlySelectedLogs:new Array<LogbookEntry>(),
        rerenderSelectedCells:false,
        currentPage:0,
        showingOptionsButton:false,
        searchText:"",
    };



    componentDidMount(): void {
        this.FlatList = React.createRef();
        this.getLogs();
        this.props.navigation.addListener('focus', this.onScreenFocus);
        this.props.navigation.setOptions({
            title: this.props.route.params.title
        });
    }



    onEditButtonPressed(){
        this.props.logbookStateKeeper.CurrentSelectedLogs = this.state.currentlySelectedLogs;
        // clear the selection or not? Thinking not in case of user error/fat fingers
        this.props.navigation.navigate(EditLogsViewName);
    }


    async resyncSelectedLogs(){
        this.setState({
            selectingMultiple:false,
            currentlySelectedLogs:new Array<LogbookEntry>(),
            refreshing:true,
        });

        LogManager.Instance.SyncEditedOrNewLogs(this.state.currentlySelectedLogs).then(async (syncing)=>{
            while (LogManager.Instance.syncingLogs || syncing){
               console.log("syncing!");
               await waitMS(1000);
               syncing = false;
           }
            console.log("done syncing!");
            // give the db a second to update so we can update colors appropriately
            await waitMS(100);
            this.setState({
                refreshing:false,
            },
                this.getLogs
            );
        });

    }



    // TODO: maybe add a callback to the logbook state keeper interface?
    logbookChanged() : boolean{
        return this.previousLogbook != this.props.logbookStateKeeper.CurrentLogbookID
    }


    onScreenFocus = () => {
        // console.log("should update:",SingleLogbookView.ShouldUpdateLogbookView);

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

        this.previousLogbook = this.props.logbookStateKeeper.CurrentLogbookID;
        this.setState({
            refreshing:true,
            currentlySelectedLogs:[]
        });

        const currentLogbook=this.props.logbookStateKeeper.CurrentLogbookID;
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

    search(searchText:string){
        this.setState({
            searchText:searchText
        });
        searchText = searchText.toLowerCase();

        // TODO: search by date, log status, what else?
        let filteredLogbookEntries = this.state.logbookEntries.filter(function (log) {
            return(
                // log.RootLog.signedMetadataJson.includes(searchText) ||
                // log.Log.signedMetadataJson.includes(searchText) ||
                    log.ImageRecord.metadata.toLowerCase().includes(searchText) ||
                    log.ImageRecord.storageLocation.toLowerCase().includes(searchText) ||
                    log.RootImageRecord.metadata.toLowerCase().includes(searchText)
            );
        });

        this.setState({filteredLogbookEntries: filteredLogbookEntries});
    }

    //TODO: for the auditor side we should be loading logs' block times so we don't have to decrypt each metadata entry
    // during LogCell instantiation and instead of the showing the decrypted timestamp just show the blocktime
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <SearchBar
                    containerStyle={{backgroundColor:"transparent"}}
                    round={true}
                    lightTheme={true}
                    placeholder="Search Logs..."
                    autoCapitalize='none'
                    autoCorrect={false}
                    onChangeText={ (text => {this.search(text)})}
                    value={this.state.searchText}
                />
                <FlatList
                        removeClippedSubviews={true}
                        ref={ (ref) => this.FlatList = ref }
                        initialNumToRender={8}
                        numColumns={Dimensions.get("window").width/120}
                        maxToRenderPerBatch={2}
                        data={this.state.filteredLogbookEntries && this.state.searchText != ""
                            ? this.state.filteredLogbookEntries
                            : this.state.logbookEntries
                        }
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
                                                margin:5,
                                                width:30,
                                                backgroundColor:"white",
                                                borderRadius: 50,
                                            }}/>
                                        :
                                            <Icon name={"checkbox-blank-circle-outline"} size={30} color={"black"} style={{
                                                margin:5,
                                                width:30,
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
            <View style={{
                position:"absolute",
                bottom:10,
                right:10,
            }}>
                {this.state.showingOptionsButton ?

                <ScrollView style={styles.buttonList}>
                        <>
                            <Button onPress={() => this.resyncSelectedLogs()}
                                    containerStyle={styles.buttonContainer}
                                    style={styles.button}
                                    type={"outline"}
                                    title="Sync"
                                    titleStyle={{color:AppButtonTint}}
                                    icon={<Icon name={"sync"} size={25} color={AppButtonTint} style={{marginRight: 7}}/>}
                            />
                            < Button onPress={() => this.onEditButtonPressed()}
                                     containerStyle={styles.buttonContainer}
                                     style={styles.button}
                                     type={"outline"}
                                    titleStyle={{color:AppButtonTint}}
                                     title="Edit"
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
                        backgroundColor: AppButtonTint,
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
                    icon={<Icon name={"dots-horizontal"} size={30} color={"white"}/>}
                />


            </View>
        )
    }

}






const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 0,

    },
    list: {
        flexDirection: 'column',
        alignItems:"flex-start",
    },
    buttonList:{
        padding:10,
        marginLeft:20,
        width:150,
        zIndex:100,
        backgroundColor:AppButtonTint,
        borderColor:"grey",
        borderRadius:10,
        alignSelf:"flex-end",
        marginBottom:10,
    },
    buttonContainer:{
        backgroundColor: "white",
        margin:5,
    },
    button:{
        width:100,
        height:100,
    }

});
