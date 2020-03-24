import {
    LogbookEntry,
    LogbookStateKeeper,
    RealmSchemas,
    UserPreference,
    UserPreferenceSchema
} from "../interfaces/Data";
import {StorageSchemaVersion, UserPreferenceKeys} from "../utils/Constants";
import {UserPreferenceStorage} from "../interfaces/Storage";
import Realm from "realm";
import {Identity} from "../interfaces/Identity";


// TODO: turn into singleton
export default class NativeUserPreferences implements LogbookStateKeeper, UserPreferenceStorage{

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
        const newRecord = new UserPreference(this.identity.PublicPGPKey,key,value );
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {

                // Create Realm objects and write to local storage
                realm.write(() => {
                    const newLog = realm.create(
                        UserPreferenceSchema.name,
                        newRecord,
                        Realm.UpdateMode.All
                    );
                });
                return  ""; // no error
            })
            .catch((error) => {
                console.log("add user preference record error: " + error);
                return error // read error
            });
    }


    public async GetPersistentUserPreferenceOrDefault(key:string):Promise<string[]>{
        return Realm.open({schema: RealmSchemas, schemaVersion: StorageSchemaVersion})
            .then(realm => {
                // Query Realm for all unsynced image hashes
                let currentUserPreference = realm.objects(UserPreferenceSchema.name).
                filtered("Key = '"+ key +"'");
                // + " AND PublicKey = " user's public key

                if (currentUserPreference.length<1 ){
                    return this.CurrentUserSettings[key];
                }
                // get the first user pref with that key
                const currentUserPreferenceList:string[] =
                    Object.setPrototypeOf(Array.from(currentUserPreference)[0],UserPreference).Preference;
                this.CurrentUserSettings[key] = currentUserPreferenceList;
                // console.log("got current user setting: ", currentUserPreferenceList);
                return currentUserPreferenceList;

            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }

    // ****************************
    // Logbook State Keeper methods:
    // ****************************

    public CurrentSelectedLogs:LogbookEntry[]=[];

    LogbookName(logbookID:string):string {
        if (logbookID ) {
            return this.CurrentUserSettings[logbookID][0];
        }
        return "Not Set"
    }

    set CurrentLogbookID(logbook){
        this.CurrentUserSettings[UserPreferenceKeys.CurrentLogbook] = [logbook];
    }


    // to satisfy the interface - can't have static methods
    get CurrentLogbookID(): string {
        // console.log("current logbook: ", this.CurrentUserSettings[UserPreferenceKeys.CurrentLogbook][0])
        return this.CurrentUserSettings[UserPreferenceKeys.CurrentLogbook][0];
    }


    get AvailableLogbooks():string[]{
        return this.CurrentUserSettings[UserPreferenceKeys.Logbooks];
    }

}