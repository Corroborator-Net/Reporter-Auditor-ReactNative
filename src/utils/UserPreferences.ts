import {LogbookStateKeeper} from "../interfaces/Data";
import {defaultAtraTableId} from "./Constants";


export default class UserPreferences implements LogbookStateKeeper{


    public static CurrentUserSettings = new Map<string,string[]>();

    public static readonly CustomImageDescriptionLabel = "Image Description";
    public static readonly CurrentLogbookKey = "Current Logbook";
    public static readonly LogbooksKey = "Logbooks";
    private static DefaultsDict:{[key:string]:string[]}={
        [UserPreferences.LogbooksKey]:[
            defaultAtraTableId,
            "48fe4d12-5598-49da-ac6b-8a2c7dda990f",
            "e2e50502-73fa-4c64-a139-b5a8b92d9bb4",
            "5e9a5ff2-8011-46bf-9d3e-4c1a6d06f1e6"],
        [UserPreferences.CurrentLogbookKey]:[defaultAtraTableId],
        [UserPreferences.CustomImageDescriptionLabel]:["none"]
    };



    public static UserSettingOrDefault(key:string):string[]{
        let currentUserSetting =  this.CurrentUserSettings.get(key);
        if (currentUserSetting == undefined ){
            currentUserSetting = this.DefaultsDict[key];
        }
        console.log("current user setting: ", currentUserSetting);
        return currentUserSetting;
    }

    static GetCurrentLogbook():string{
        return UserPreferences.UserSettingOrDefault(UserPreferences.CurrentLogbookKey)[0];
    }

    // to satisfy the interface
    get CurrentLogbook(): string {
        return UserPreferences.UserSettingOrDefault(UserPreferences.CurrentLogbookKey)[0];
    }
}