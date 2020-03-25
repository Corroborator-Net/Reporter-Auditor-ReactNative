import React from "react";
import {FlatList, Platform, RefreshControl, SafeAreaView, StyleSheet} from "react-native";
import LogbookCell from "../components/LogbookCell";
import {LogbookStateKeeper} from "../interfaces/Data";
import {ImageDatabase, UserPreferenceStorage} from "../interfaces/Storage";
import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import {LogsViewName, UserPreferenceKeys} from "../utils/Constants";
import {requestStoragePermission, requestWritePermission} from "../utils/RequestPermissions";


type State={
    logbooks:string[]
    logbookNames:Map<string, string>
    logbookPhotos:Map<string, string>
    refreshingLogs:boolean
}

type  Props={
    imageSource:ImageDatabase;
    navigation: any;
    logbookStateKeeper:LogbookStateKeeper;
    blockchainInterface:BlockchainInterface;
    userPreferences:UserPreferenceStorage;
}
const isMobile = Platform.OS == 'android' || Platform.OS == 'ios';
export default class MultiLogbookView extends React.PureComponent<Props, State> {

    state={
        logbooks:new Array<string>(),
        logbookNames:new Map<string, string>(),
        logbookPhotos:new Map<string, string>(),
        refreshingLogs:false
    };

    async getLogbooksAndNames(){
        // get all the saved logbooks
        let logbooks = this.props.logbookStateKeeper.AvailableLogbooks.slice();
        // get all the saved logbook names
        let logbookNames = this.state.logbookNames;
        for (const logbookID of logbooks ){
            const logbookName =
                await this.props.logbookStateKeeper.LogbookName(logbookID);
            logbookNames.set(logbookID, logbookName);
        }

        if (logbooks[1]!="custom1") {
            logbooks.unshift("custom1");
        }
        if (logbooks[0]!="custom0") {
            logbooks.unshift("custom0");
        }

        this.setState({
            logbooks:logbooks
        })
    }

    showUploadPrompt(){
        if (isMobile){
            
        }
    }


    componentDidMount = async () => {
        if (isMobile) {
            await requestStoragePermission();
            await requestWritePermission();
            // get the current saved logbooks in user storage
            await this.props.userPreferences.GetPersistentUserPreferenceOrDefault(UserPreferenceKeys.Logbooks);
            this.props.userPreferences.SetNewPersistentUserPreference("RequireReadWrite", ["GiveMePermission"]);
            this.getLogbooksAndNames();
        }
    };


    render() {
        return (
            <SafeAreaView style={styles.container}>

                <FlatList
                    removeClippedSubviews={true}
                    initialNumToRender={1}
                    numColumns={2}
                    maxToRenderPerBatch={2}
                    data={this.state.logbooks}
                    contentContainerStyle={styles.list}
                    renderItem={({item}) =>
                        item == this.state.logbooks[1] ?
                            <LogbookCell
                                onLongPress={()=>{}}
                                title={"Add New Logbook"}
                                onPress={ ()=>{
                                    this.setState({refreshingLogs:true},
                                    this.AddNewLogbook
                                    )}
                                }
                            />
                            :
                            item == this.state.logbooks[0] ?
                                <LogbookCell
                                    onLongPress={()=>{}}
                                    title={"Manual File Upload/Check"}
                                    onPress={ ()=>{
                                        this.showUploadPrompt();
                                    }}
                                />
                                :
                                <LogbookCell
                                    // src= { `data:image/jpeg;base64,${this.state.photos.get(item.dataMultiHash)}`}
                                    // {"data:image/jpeg;base64,"} // to test local-only storage on auditor side,
                                    // don't pass an image
                                    onLongPress={(newName:string)=>{
                                        this.onLogbookNameEditingFinished(item,newName)}
                                    }
                                    title={this.state.logbookNames.get(item) || ""}
                                    onPress={() => {
                                        this.props.logbookStateKeeper.CurrentLogbookID = item;
                                        this.props.navigation.navigate(LogsViewName, {
                                            title:this.state.logbookNames.get(item)});
                                    }}
                                />

                    }
                    keyExtractor={item => item}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshingLogs}
                            onRefresh={() => this.getLogbooksAndNames()}/>
                    }
                />
            </SafeAreaView>
        );
    }


    async onLogbookNameEditingFinished(logbookID:string, newName: string){
        let logbookNames = this.state.logbookNames;
        logbookNames.set(logbookID, newName);

        this.props.userPreferences.SetNewPersistentUserPreference(logbookID, [newName]);

        // // update the state, but don't move the new logbook button, add at index 1
        this.setState({
            logbookNames:logbookNames,
        },
        this.getLogbooksAndNames)


    }


    async AddNewLogbook(){
        const newLogbookID = await this.props.blockchainInterface.getNewLogbook();

        // add the new logbook to the list
        let newStateLogbooks = this.state.logbooks;
        newStateLogbooks.splice(1,0,newLogbookID);

        this.props.userPreferences.SetNewPersistentUserPreference(UserPreferenceKeys.Logbooks, newStateLogbooks.slice(1));

        console.log("new logbooks to save: ", newStateLogbooks);
        const date  = new Date();
        const newName = date.toLocaleDateString() + "-" + date.toLocaleTimeString();

        let logbookNames = this.state.logbookNames;
        logbookNames.set(newLogbookID, newName);

        this.props.userPreferences.SetNewPersistentUserPreference(newLogbookID, [newName]);


        // // update the state, but don't move the new logbook button, add at index 1
        this.setState({
            logbooks:newStateLogbooks,
            logbookNames:logbookNames,
            refreshingLogs:false,
        })

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

});
