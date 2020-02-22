import {LogbookDatabase, LogTransaction} from "./Models";

export default class BlockchainStorage implements LogbookDatabase {
    // @ts-ignore
    addNewRecord(logBookAddress: string, newRecord: LogTransaction): Promise<string> {
        return null;
    }

    getRecordsFor(logBookAddress: string): [LogTransaction] {
        // @ts-ignore
        return [undefined];
    }

}
