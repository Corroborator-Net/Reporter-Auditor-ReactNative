
import {UserPreferenceKeys} from "../shared/Constants";
import {UserPreferenceStorage} from "../interfaces/Storage";
import {Identity} from "../interfaces/Identity";


// TODO: turn into singleton
export default class NativeUserPreferences implements UserPreferenceStorage{


    private static _Instance:NativeUserPreferences;
    private CurrentUserSettings: {[key:string]:string[]} = {};


    static get Instance(): NativeUserPreferences {
        return this._Instance;
    }

    constructor(public identity:Identity) {
        const DefaultsDict:{[key:string]:string[]}={
            [UserPreferenceKeys.Logbooks]:[],
            [UserPreferenceKeys.CurrentLogbook]:[],
            [UserPreferenceKeys.ImageDescription]:["none"],
            // [UserPreferenceKeys.AutoSyncLogs]:["false"]

        };
        NativeUserPreferences._Instance = this;
        NativeUserPreferences._Instance.CurrentUserSettings = DefaultsDict;
        return this
    }

    async Initialize(){
        for(const key of Object.keys(this.CurrentUserSettings)){
            this.CurrentUserSettings[key] = await this.GetPersistentUserPreferenceOrDefault(key);
        }
        const allLogbooks = this.CurrentUserSettings[UserPreferenceKeys.Logbooks];

        for (const logbookID of allLogbooks){
            // console.log("loading name for id:", logbookID);
            this.CurrentUserSettings[logbookID]= await this.GetPersistentUserPreferenceOrDefault(logbookID);
        }
    }

    public GetCachedUserPreference(key:string):string[]{
        return this.CurrentUserSettings[key];
    }


    // Whoever calls this should call GetPersistentUserPreferenceOrDefault first to not overwrite the preference
    public SetNewPersistentUserPreference(key:string, value:string[]){
        // save it to cache
        this.CurrentUserSettings[key] = value;
        // save it to storage
    }


    public async GetPersistentUserPreferenceOrDefault(key:string):Promise<string[]>{
        return this.CurrentUserSettings[key]?this.CurrentUserSettings[key] : [""];
    }



}
