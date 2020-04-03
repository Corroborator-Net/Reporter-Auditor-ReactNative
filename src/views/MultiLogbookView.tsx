import React from "react";
import {Alert, FlatList, RefreshControl, SafeAreaView, StyleSheet} from "react-native";
import LogbookCell from "../components/LogbookCell";
import {HashData, ImageRecord, Log, LogbookAndSection, LogbookEntry} from "../interfaces/Data";
import {ImageDatabase, UserPreferenceStorage} from "../interfaces/Storage";
import {BlockchainInterface} from "../interfaces/BlockchainInterface";
import {CorroborateLogsViewNameAndID, isMobile, LogsViewName, UserPreferenceKeys} from "../shared/Constants";
import {requestStoragePermission, requestWritePermission} from "../native/RequestPermissions";
import DocumentPicker from 'react-native-document-picker';
import {Identity} from "../interfaces/Identity";
import RNFetchBlob from "rn-fetch-blob";
import HashManager from "../shared/HashManager";
import {LogManager} from "../shared/LogManager";
import LogbookStateKeeper from "../shared/LogbookStateKeeper";
import WebLogbookAndImageManager from "../web/WebLogbookAndImageManager";

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
    identity:Identity;
}
const customButtons = 2;

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

    async showUploadPrompt(){
        if (isMobile){
            try {
                const selectedImages = await DocumentPicker.pickMultiple({
                    type: [DocumentPicker.types.images],
                });

                let index = 0;
                let logbooksWithLogsToCheckIfHashIsPresent:{[logbook:string]:Log[]}= {};
                let allOnChainLogsInUserUploadedLogTreeByLogbookAddress:{[logbookAddress:string]:Log[]} = {};
                // add unfound section
                const unfoundKey = "Not Found";
                const noLogbookKey = "No Logbook in metadata";
                allOnChainLogsInUserUploadedLogTreeByLogbookAddress[unfoundKey] = new Array<Log>();
                for (const res of selectedImages) {
                    RNFetchBlob.fs.readFile(res.uri, 'base64')
                        .then(async (data) => {
                            // load jpeg - this could be from local file system or the cloud
                            const uploadedImageHash = HashManager.GetHashSync(data);

                            const imageRecord = new ImageRecord(
                                new Date(),
                                res.uri,
                                "",
                                uploadedImageHash,
                                data,
                            );

                            // look in the image's metadata for a logbook id
                            const imageInformation = ImageRecord.GetExtraImageInformation(imageRecord);
                            const logbookAddress = imageInformation? imageInformation.LogbookAddress : noLogbookKey;
                            let matchingLogs:Log[] = [];

                            WebLogbookAndImageManager.Instance.addImageRecordAtHash(imageRecord, uploadedImageHash);
                            // let's fill logbook address with logs to check if the uploaded logs are present on chain
                            if (imageInformation){
                                console.log("filling logbooks with logs from blockchain!");
                                try {
                                    if (!logbooksWithLogsToCheckIfHashIsPresent[logbookAddress]) {
                                        logbooksWithLogsToCheckIfHashIsPresent[logbookAddress] =
                                            await this.props.blockchainInterface.getRecordsFor(logbookAddress);
                                    }
                                }
                                catch (e) {
                                    Alert.alert(
                                        'Server Error - Try Again', e+"", [{text: 'OK'},],
                                        { cancelable: false }
                                    );
                                    return;
                                }
                                // console.log("logs at logbook",JSON.stringify(logbooksWithLogsToCheckIfHashIsPresent[logbookAddress], null, 2));
                                matchingLogs = logbooksWithLogsToCheckIfHashIsPresent[logbookAddress].
                                filter((log)=> log.currentDataMultiHash == uploadedImageHash);

                            }

                            // no matching logs on chain
                            if (matchingLogs.length==0){
                                const missingLog = new Log(logbookAddress,
                                    "",
                                    "",
                                    "",
                                    uploadedImageHash,
                                    uploadedImageHash,
                                    "",
                                    "",
                                    null,
                                    null
                                    );
                                let newLogs = allOnChainLogsInUserUploadedLogTreeByLogbookAddress[unfoundKey];
                                newLogs.push(missingLog);
                                allOnChainLogsInUserUploadedLogTreeByLogbookAddress[unfoundKey] = newLogs;
                                console.log("NO matching log on the blockchain", allOnChainLogsInUserUploadedLogTreeByLogbookAddress[unfoundKey]);
                            }
                            else{
                                // For any log in the tree, get all logs in the tree so the tree can be constructed later
                                const [allLogsInLogTree, originalLog] = Log.GetAllLogsInTreeFromAnyLogInTree(matchingLogs,
                                        logbooksWithLogsToCheckIfHashIsPresent[logbookAddress]);

                                // update the root multihash with a trunk log's hash
                                imageRecord.rootMultiHash = originalLog.rootDataMultiHash;
                                // console.log("all logs in tree",JSON.stringify(allLogsInLogTree, null, 2) );

                                WebLogbookAndImageManager.Instance.updateImageRecordAtHash(
                                    imageRecord,
                                    originalLog.rootDataMultiHash);

                                if (!allOnChainLogsInUserUploadedLogTreeByLogbookAddress[logbookAddress]) {
                                    allOnChainLogsInUserUploadedLogTreeByLogbookAddress[logbookAddress] = allLogsInLogTree;
                                }
                                else{
                                    allOnChainLogsInUserUploadedLogTreeByLogbookAddress[logbookAddress] = allOnChainLogsInUserUploadedLogTreeByLogbookAddress[logbookAddress]
                                        .concat(allLogsInLogTree);
                                }

                                // const metadata = JSON.parse(corroboratedLog.encryptedMetadataJson);
                                // const pubKey = Object.keys(metadata)[0];
                                // console.log("first item in metadata:",pubKey);
                                // if (this.props.identity.PublicPGPKey != )

                                // corroborate the log on the chain
                                // const newHashToLog:HashData = {
                                //     currentMultiHash:uploadedImageHash,
                                //     storageLocation:"file",
                                //     metadataJSON:"{}"
                                // };
                                //
                                // LogManager.Instance.OnNewHashProduced(
                                //     newHashToLog,
                                //     logbookAddress,
                                //     false
                                // );
                            }

                            index+=1;
                            // console.log(index, selectedImages.length);
                            if (index == selectedImages.length){
                                // console.log("all logs to display:",allLogsByLogbookAddress);
                                this.NavigateToCorroboratedLogsView(allOnChainLogsInUserUploadedLogTreeByLogbookAddress)
                            }
                        });

                }




            } catch (err) {
                if (DocumentPicker.isCancel(err)) {
                    // User cancelled the picker, exit any dialogs or menus and move on
                } else {
                    throw err;
                }
            }
        }
        else{
            // TODO: WEB platform: show a drag + drop field or have them enter a logbook address to pull from the chain/atra
        }
    }

    NavigateToCorroboratedLogsView(allLogsByLogbookAddress:{[logbookAddress:string]:Log[]}){
        // after we're finished assiging logs to "Not found" or their logbook section, make the appropriate
        // data structure
        let logbooksPerAddress:LogbookAndSection[] = [];
        for (const logbook of Object.keys(allLogsByLogbookAddress)){
            // console.log("loading logbook:", allLogsByLogbookAddress[logbook]);
            logbooksPerAddress.push({
                title:logbook,
                logs:allLogsByLogbookAddress[logbook]
            })
        }

        this.props.logbookStateKeeper.LogsToCorroborate =  logbooksPerAddress;
        this.props.logbookStateKeeper.CurrentLogbookID = CorroborateLogsViewNameAndID;
        this.props.navigation.navigate(CorroborateLogsViewNameAndID, {title:CorroborateLogsViewNameAndID});

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
        newStateLogbooks.splice(customButtons,0,newLogbookID);

        this.props.userPreferences.SetNewPersistentUserPreference(UserPreferenceKeys.Logbooks,
            newStateLogbooks.slice(customButtons));

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
