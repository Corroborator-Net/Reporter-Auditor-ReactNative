import {Identity} from "./interfaces/Identity";
import {FirstReporterPublicKey} from "./utils/Constants";

export default class NativeDID implements Identity{
    addTrustedPeerAttestation(did: string): string {
        return "";
    }

    sign(base64Data: string): string {
        return "";
    }

    getMyAddress(): string {
        return FirstReporterPublicKey;
    }
}