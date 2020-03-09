import {Identity} from "../interfaces/Identity";
import {FirstReporterPublicKey} from "../utils/Constants";
import { Wallet } from "ethers";

export default class NativeDID implements Identity{

    static Wallet:Wallet = Wallet.fromMnemonic("ripple scissors kick mammal hire column oak again sun offer wealth tomorrow wagon turn fatal");;

    addTrustedPeerAttestation(did: string): string {
        return "";
    }

    sign(base64Data: string): string {
        return "";
    }

    // TODO: allow user to filter logs by logbook and choose a different logbook
    getMyAddress(): string {
        console.log(NativeDID.Wallet.address);
        const { address } = NativeDID.Wallet;
        console.log("address:",address);
        NativeDID.Wallet.signMessage("bleeeblahhbloo").then((val=>{
            console.log("signature:",val);
        }));
        return FirstReporterPublicKey;
    }

}