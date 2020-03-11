export const StorageSchemaVersion = 1;
export const FirstReporterPublicKey="188f7940020dbd1bfd2841a55ec0e4f9c58af16fb216ba0af818845710463aa2";
export const HQPubKey="ba23e2b0f59d77d72367d2ab4c33fa339c6ec02e536d4a6fd4e866f94cdc14be";
export const HQPrivKey="258372658d63354eb9b87e1130b57af1f3b37463269b59ac71e5bbcfb86cfa51";
export const ReporterPrivKey="a02ccb225a841e16946ecb9ffc2ee41b7f87be652f944dd6c3e0be210da1e3c5";
// export const defaultAtraTableId="93bc7f28-2a29-4489-9a0d-65cc7fee1b32";
// TODO get path for iOS
export const AndroidFileStorageLocation="file:///storage/emulated/0/Pictures/";
//@ts-ignore
export const waitMS = ms => new Promise(res => setTimeout(res, ms));

export const LocalOnly = "orange";
export const CorroboratedUnsynced = 'yellow';
export const Synced = 'lightgreen';

export const DetailsScreenName = "Details";
export const LogsScreenName = "Logs";

export const UserPreferenceKeys={
    ImageDescription:"Image Description",
    CurrentLogbook:"Current Logbook",
    Logbooks:"Logbooks",
    AutoSyncLogs:"Auto Sync Logs"
};