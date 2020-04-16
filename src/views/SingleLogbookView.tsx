import React from "react";
import {
    Dimensions,
    FlatList,
    RefreshControl,
    SafeAreaView, ScrollView, SectionList,
    StyleSheet,
    View
} from "react-native";
import {ImageDatabase} from "../interfaces/Storage";
import {Log, LogbookEntry} from "../interfaces/Data";
import LogCell from "../components/LogCell";
import {Button, SearchBar, Text} from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import _ from 'lodash';
import {
    AppButtonTint,
    DetailLogViewName,
    EditLogsViewName,
    PrependJpegString,
    waitMS
} from "../shared/Constants";
import { LogManager} from "../shared/LogManager";
import LogbookStateKeeper from "../shared/LogbookStateKeeper";

type State={
    logbookEntries:LogbookEntryAndSection[]
    filteredLogbookEntries:LogbookEntryAndSection[]
    refreshing:boolean
    selectingMultiple:boolean
    currentlySelectedLogs:LogbookEntry[]
    rerenderSelectedCells:boolean
    currentPage:number
    showingOptionsButton:boolean
    searchText:string

}

type Props={
    logbookStateKeeper:LogbookStateKeeper;
    imageSource:ImageDatabase;
    navigation: any;
    route:any;
}

type LogbookEntryAndSection={
    title:string
    data:LogbookEntry[]
}

export default class SingleLogbookView extends React.PureComponent<Props, State> {

    readonly LogSize = 120;
    static ShouldUpdateLogbookView = false;
    previousLogbook = "";

    state={
        logbookEntries:new Array<LogbookEntryAndSection>(),
        filteredLogbookEntries:new Array<LogbookEntryAndSection>(),
        refreshing:false,
        selectingMultiple:false,
        currentlySelectedLogs:new Array<LogbookEntry>(),
        rerenderSelectedCells:false,
        currentPage:0,
        showingOptionsButton:false,
        searchText:"",
    };



    componentDidMount(): void {
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

        LogManager.Instance.SyncEditedLogs(this.state.currentlySelectedLogs).then(async (syncing)=>{
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


    async getLogs(){

        this.previousLogbook = this.props.logbookStateKeeper.CurrentLogbookID;
        this.setState({
            selectingMultiple:false,
            refreshing:true,
            currentlySelectedLogs:[]
        });

        console.log("loading logs for logbook: ", this.previousLogbook);
        // get all of our reporters' logs - this will either be local storage or blockchain storage
        let logbooksInSectionsWithLogs = (await this.props.logbookStateKeeper.GetAllLogsAndSectionsForCurrentLogbook());
            // .slice(this.state.currentPage, this.LogsPerPage);


        const onlyShowingOneLogbook = logbooksInSectionsWithLogs.length == 1;

        let logsSectionedByDateAndLogbook:{[dateAndLogbook:string]:LogbookEntry[]} = {};
        for (const logsByLogbook of logbooksInSectionsWithLogs){

            let rootLogs = Log.GetRootLogsByFirstLoggedPublicKey(logsByLogbook.logs);
             // console.log("rootLogs:", JSON.stringify(rootLogs, null, 2)); // spacing level = 2

            for (const log of rootLogs){
                // Get all records with the same root hash
                const imageRecords = await this.props.imageSource.getImageRecordsWithMatchingRootHash(log.currentDataMultiHash);
                // console.log("imagerecords:", imageRecords.length);
                const logbookEntry = new LogbookEntry(log, logsByLogbook.logs, imageRecords);
                const date = logbookEntry.RootImageRecord.timestamp.toDateString();
                const logbookTitle = date + (onlyShowingOneLogbook ? "" : (" " + logsByLogbook.title));
                if (logsSectionedByDateAndLogbook[logbookTitle]){
                    logsSectionedByDateAndLogbook[logbookTitle].push(logbookEntry)
                }
                else{
                    logsSectionedByDateAndLogbook[logbookTitle] = [logbookEntry]
                }

            }
        }


        let logsAndSections:LogbookEntryAndSection[] = [];
        Object.keys(logsSectionedByDateAndLogbook).forEach(function (key) {
            logsAndSections.push({
                title:key,
                data:logsSectionedByDateAndLogbook[key],
            })
        });





        this.setState({
            logbookEntries:logsAndSections,
            refreshing:false,
        });
    }

    search(searchText:string){
        this.setState({
            searchText:searchText
        });
        searchText = searchText.toLowerCase();

        // TODO: search by date, log status, what else?
        let filteredLogbookEntries:LogbookEntry[] =[];
        this.state.logbookEntries.forEach(
            (value => {
                filteredLogbookEntries = filteredLogbookEntries.concat(value.data.filter(function (log) {
                    return(
                        // log.RootLog.signedMetadataJson.includes(searchText) ||
                        // log.Log.signedMetadataJson.includes(searchText) ||
                        log.HeadImageRecord.metadataJSON.toLowerCase().includes(searchText) ||
                        log.HeadImageRecord.storageLocation.toLowerCase().includes(searchText) ||
                        log.RootImageRecord.metadataJSON.toLowerCase().includes(searchText)
                    );
                }));
            })
        );

        const sectionAndEntries:LogbookEntryAndSection[] = [{data:filteredLogbookEntries, title:"Results"}];
        this.setState({filteredLogbookEntries: sectionAndEntries});
    }


// select multiple is passed upon every longpress

    _renderItem = ({ item }: { item: LogbookEntry }) =>(
            <LogCell
                beginSelectingMultiple={()=>this.beginSelectingMultiple(item)}
                onSelectLog={()=>this.onSelectLog(item)}
                selectingMultiple={this.state.selectingMultiple}
                src={PrependJpegString(item.HeadImageRecord.base64Data)}
                // {"data:image/jpeg;base64,"}
                // to test local-only storage on auditor side, don't pass an image
                item={item}
            />
    )

    //@ts-ignore - we set the height of item is fixed
    getItemLayout = (data, index) => (
        {length: this.LogSize, offset: this.LogSize * index, index}
    );

    _renderList = ({ section, index }:
                       { section: LogbookEntryAndSection, index:number }) => (
        index !== 0 ? null :
        <View style={styles.container}>
            <FlatList
                initialNumToRender={8}
                numColumns={Dimensions.get("window").width/this.LogSize}
                maxToRenderPerBatch={10}
                getItemLayout={this.getItemLayout}
                data={section.data}
                removeClippedSubviews={true}
                extraData={this.state.rerenderSelectedCells}
                keyExtractor={((item1, index) => item1.RootLog.currentDataMultiHash + index)}
                renderItem={this._renderItem}
                />
        </View>
    );


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <SearchBar
                    containerStyle={{backgroundColor:"transparent"}}
                    round={true}
                    lightTheme={true}
                    placeholder="Search Logs"
                    autoCapitalize='none'
                    autoCorrect={false}
                    onChangeText={ (text => {this.search(text)})}
                    value={this.state.searchText}
                />
                <SectionList
                    renderSectionHeader={({ section: { title } }) => (
                        <Text>{title}</Text>
                    )}
                    // getItemLayout={this.getItemLayout}
                    initialNumToRender={2}
                    maxToRenderPerBatch={10}
                    sections={this.state.filteredLogbookEntries && this.state.searchText != ""
                        ? this.state.filteredLogbookEntries
                        : this.state.logbookEntries
                    }
                    //@ts-ignore
                    renderItem={this._renderList}
                    keyExtractor={(item, index) => item.RootLog.currentDataMultiHash + index}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={()=>this.getLogs()}/>
                    }
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
