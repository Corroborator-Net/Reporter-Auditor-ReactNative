import {Platform} from "react-native";
import {Button} from "react-native-elements";
import React from "react";

export const StorageSchemaVersion = 1;

export const isMobile = Platform.OS == 'android' || Platform.OS == 'ios';

//@ts-ignore
export const waitMS = ms => new Promise(res => setTimeout(res, ms));

export const LocalOnly = "orange";
export const CorroboratedUnsynced = 'yellow';
export const Synced = 'lightgreen';

export const DetailLogViewName = "Details";
export const LogsViewName = "Logs";
export const EditLogsViewName = "EditLogs";
export const CorroborateLogsViewNameAndID = "Uploaded Logs";

export const AppButtonTint='#459cff';

export const OriginalAlbum = "Original Corroborator Pictures";
export const ModifiedAlbum = "Modified Corroborator Pictures";

export const UserPreferenceKeys={
    ImageDescription:"Image Description",
    CurrentLogbook:"Current Logbook",
    Logbooks:"Logbooks",
    // AutoSyncLogs:"Auto Sync Logs"
};

export function PrependJpegString(imageData:string):string{
return `data:image/jpeg;base64,${imageData}`;
}


// TODO extend to ios
export function GetPathToCameraRoll(fileName:string, original:boolean){
    let StorageLocation="file:///storage/emulated/0/Pictures/";
    if (Platform.OS == 'ios'){
        console.log("ERROR, IOS FULL PATH NOT YET TESTED")
    }
    if (original){
        StorageLocation += OriginalAlbum + "/"
    }
    else{
        StorageLocation += ModifiedAlbum + "/"
    }
    return StorageLocation +fileName;
}

export const LoadingSpinner =  <Button loading={true} type={"clear"} loadingProps={{size:"large"}} />;




export function makeID(length: number): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}