import {Identity} from "./interfaces/Identity";
import {FirstReporterPublicKey} from "./Constants";

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