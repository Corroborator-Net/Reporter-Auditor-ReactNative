import {LogbookEntry} from "../interfaces/Data";
import {CorroborateLogsViewNameAndID, UserPreferenceKeys} from "./Constants";
import {LogbookDatabase, UserPreferenceStorage} from "../interfaces/Storage";
import {LogbookAndSection} from "../interfaces/Data";



export default class LogbookStateKeeper {


    public LogsToCorroborate:LogbookAndSection[] = [];
    public CurrentSelectedLogs:LogbookEntry[]=[];

    private _CurrentLogbookID:string = "";

    constructor(public userPreferences:UserPreferenceStorage,
                public logbookStorage:LogbookDatabase) {
    }


    LogbookName(logbookID:string):string {
        if (logbookID ) {
            return this.userPreferences.GetCachedUserPreference(logbookID)[0];
        }
        return "Not Set"
    }

    set CurrentLogbookID(logbook){
        this._CurrentLogbookID = logbook;
        // this.userPreferences.SetNewPersistentUserPreference(UserPreferenceKeys.CurrentLogbook,[logbook]);
    }


    // to satisfy the interface - can't have static methods
    get CurrentLogbookID(): string {
        return this._CurrentLogbookID;
        // console.log("current logbook: ", this.CurrentUserSettings[UserPreferenceKeys.CurrentLogbook][0])
        // return this.userPreferences.GetCachedUserPreference(UserPreferenceKeys.CurrentLogbook)[0];
    }


    get AvailableLogbooks():string[] {
        return this.userPreferences.GetCachedUserPreference(UserPreferenceKeys.Logbooks);
    }

    async GetAllLogsAndSectionsForCurrentLogbook(): Promise<LogbookAndSection[]> {
        if (this._CurrentLogbookID == CorroborateLogsViewNameAndID){
            return this.LogsToCorroborate
        }

        return [{
            title: this._CurrentLogbookID,
            logs: await this.logbookStorage.getRecordsFor(this._CurrentLogbookID)
        }];

    }

}