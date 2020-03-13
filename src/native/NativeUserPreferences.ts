import {
    LogbookStateKeeper,
    RealmSchemas,
    UserPreference,
    UserPreferenceSchema
} from "../interfaces/Data";
import {FirstReporterPublicKey, StorageSchemaVersion, UserPreferenceKeys} from "../utils/Constants";
import {UserPreferenceStorage} from "../interfaces/Storage";
import Realm from "realm";


// TODO: turn into singleton
export default class NativeUserPreferences implements LogbookStateKeeper, UserPreferenceStorage{
    static get Instance(): NativeUserPreferences {
        if (NativeUserPreferences._Instance){
            return NativeUserPreferences._Instance;
        }
        const DefaultsDict:{[key:string]:string[]}={
            [UserPreferenceKeys.Logbooks]:[],
            [UserPreferenceKeys.CurrentLogbook]:[],
            [UserPreferenceKeys.ImageDescription]:["none"],
            // [UserPreferenceKeys.AutoSyncLogs]:["false"]

        };

        this._Instance = new NativeUserPreferences();
        this._Instance.CurrentUserSettings = DefaultsDict;
        this._Instance.LoadAllSavedPreferences();
        return this._Instance;
    }

    private static _Instance:NativeUserPreferences;

    private CurrentUserSettings: {[key:string]:string[]} = {};


    private async LoadAllSavedPreferences(){
        for(const key of Object.keys(this.CurrentUserSettings)){
            this.CurrentUserSettings[key] = await this.GetPersistentUserPreferenceOrDefault(key);
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
        const newRecord = new UserPreference(FirstReporterPublicKey,key,value );
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
                console.log("got current user setting: ", currentUserPreferenceList);
                return currentUserPreferenceList;

            })
            .catch((error) => {
                console.log(error);
                return error // read error
            });
    }


    set CurrentLogbook(logbook){
        this.CurrentUserSettings[UserPreferenceKeys.CurrentLogbook] = [logbook];
    }


    // to satisfy the interface - can't have static methods
    get CurrentLogbook(): string {
        return this.CurrentUserSettings[UserPreferenceKeys.CurrentLogbook][0];
    }


    get AvailableLogbooks():string[]{
        return this.CurrentUserSettings[UserPreferenceKeys.Logbooks];
    }

}