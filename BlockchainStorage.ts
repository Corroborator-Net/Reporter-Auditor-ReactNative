import {ImageDatabase, ImageRecord} from "./Models";

export default class BlockchainStorage implements ImageDatabase {
    add(picture: ImageRecord): Promise<string> {
        return fetch("explorer").then(
            () => {
                return ""
            }
        ).catch(error=>{
            return error
        })
    }
}
