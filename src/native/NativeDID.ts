import {Identity} from "../interfaces/Identity";
// @ts-ignore
import { RSA } from 'hybrid-crypto-js';
import * as Keychain from 'react-native-keychain';
import {Platform} from "react-native";


export default class NativeDID implements Identity{

    // static menmonic = "ripple scissors kick mammal hire column oak again sun offer wealth tomorrow wagon turn fatal";
    // static Wallet:Wallet = Wallet.fromMnemonic(NativeDID.menmonic);
    private readonly HQPEMKey = {
        publicKey: "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhFT0yrRSpuEdxRXf6Vc9nER+i+T18w1dEO4uyc45tSadtFzYfcY1jXC/f7MVdXMAawv5Qp04OdkKyEt3lrrY /xBEOKJyraGQMMKlZaMet4M1jeE+fq+nEaB7/E/XeBoSUOlG1J0o7pVVHDh7Kvs7rVQZ9FJh44MVQOWg4jmnlXLzyHRyAbyLQcSK7uwbFFebiXAZ7k+2UoSWwA9/Pagg99Nfr+AU1uZGyiPcXDzrZbCJnDdH9742QCfw5ct5l6TH2F0wJsXSGE2Ocp5O7qrzNdObB1xmlxg2XPjMUGNtgiE6c/sejpQpBulrzvcrSqiSUcvO83nF1k91dgIiGv9fLQIDAQAB-----END PUBLIC KEY-----"
    };

    private _PublicPGPKey:string = "";
    private _PrivatePGPKey:string = "";
    private _TrustedPeerPGPKeys:string[] = [this.HQPEMKey.publicKey];

    get PublicPGPKey():string{
        return this._PublicPGPKey;
    }

    get PrivatePGPKey():string{
        return this._PrivatePGPKey;
    }

    get TrustedPeerPGPKeys():string[]{
        return this._TrustedPeerPGPKeys;
    }

    async LoggedIn(){
        // await Keychain.resetGenericPassword();
        const credentials = await Keychain.getGenericPassword();
        // console.log("got credentials:", credentials);
        if (credentials!= false){
            this._PrivatePGPKey = credentials.password;
            this._PublicPGPKey = credentials.username;
            return true;
        }
        return false
    }


    async GenerateAndSavePGPKeys(){
        // Here's a web version for reference
        console.log("creating rsa");
        const rsa = new RSA({rsaStandard: 'RSA-OAEP'});
        console.log("generating keys for hybrid crypto library, this may take minutes!!");
        //TODO: This takes around 2 minutes sometimes!! - get a better keygen library
        const keyPair = await rsa.generateKeyPairAsync(2048);
        this._PrivatePGPKey = keyPair.privateKey;
        this._PublicPGPKey = keyPair.publicKey;


        const ACCESS_CONTROL_MAP = [
            Keychain.ACCESS_CONTROL.USER_PRESENCE,
        ];
        const ACCESS_CONTROL_MAP_ANDROID = [
            null,
            Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        ];
        const SECURITY_LEVEL_MAP = [
            Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
            Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        ];

        const SECURITY_STORAGE_MAP = [
            null,
            Keychain.STORAGE_TYPE.FB,
            Keychain.STORAGE_TYPE.AES,
            Keychain.STORAGE_TYPE.RSA,
        ];
        const AC_MAP =
            Platform.OS === 'ios' ? ACCESS_CONTROL_MAP : ACCESS_CONTROL_MAP_ANDROID;

        // TODO: how to save them to browser keychain for web/auditor user - maybe they load their own every time?

        const saveResult = await Keychain.setGenericPassword(
            this._PublicPGPKey,
            this._PrivatePGPKey,

            {
                accessControl: AC_MAP[0],
                securityLevel: Platform.OS === 'ios' ? [] : SECURITY_LEVEL_MAP[0],
                storage: Platform.OS === 'ios' ? [] : SECURITY_STORAGE_MAP[2],
            }
        );

        return saveResult != false;
    }


    constructor() {

    }

    public async Initialize(){

    }

    // Ethereum setup:
    // console.log(NativeDID.Wallet.address);
    // const wallet2 = Wallet.fromMnemonic(NativeDID.menmonic);
    // const address = NativeDID.Wallet.address;
    // const address2= wallet2.address;
    //
    // console.log("address1:",address, "address2:", address2);
    // NativeDID.Wallet.signMessage("bleeeblahhbloo").then((val=>{
    //     console.log("signature:",val);
    // }));







}