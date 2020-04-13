import {Identity} from "../interfaces/Identity";
// @ts-ignore
import { RSA,Crypt } from 'hybrid-crypto-js';

export default class CrossPlatformIdentity implements Identity{

    static Crypt = new Crypt();
    // static menmonic = "ripple scissors kick mammal hire column oak again sun offer wealth tomorrow wagon turn fatal";
    // static Wallet:Wallet = Wallet.fromMnemonic(NativeDID.menmonic);
    private readonly HQPEMKey = {
        publicKey: "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhFT0yrRSpuEdxRXf6Vc9nER+i+T18w1dEO4uyc45tSadtFzYfcY1jXC/f7MVdXMAawv5Qp04OdkKyEt3lrrY /xBEOKJyraGQMMKlZaMet4M1jeE+fq+nEaB7/E/XeBoSUOlG1J0o7pVVHDh7Kvs7rVQZ9FJh44MVQOWg4jmnlXLzyHRyAbyLQcSK7uwbFFebiXAZ7k+2UoSWwA9/Pagg99Nfr+AU1uZGyiPcXDzrZbCJnDdH9742QCfw5ct5l6TH2F0wJsXSGE2Ocp5O7qrzNdObB1xmlxg2XPjMUGNtgiE6c/sejpQpBulrzvcrSqiSUcvO83nF1k91dgIiGv9fLQIDAQAB-----END PUBLIC KEY-----"
    };

    private _PublicPGPKey:string = "";
    private _PrivatePGPKey:string = "";
    // TODO: commented out HQ until Atra can handle more keys
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

        this._PrivatePGPKey = "";
        this._PublicPGPKey = "";
        return true;
    }


    async GenerateAndSavePGPKeys(){
        // Here's a web version for reference
        console.log("creating rsa");
        const rsa = new RSA({rsaStandard: 'RSA-OAEP'});
        console.log("generating keys for hybrid crypto library, this may take minutes!!");

        //TODO: This takes around 2 minutes sometimes!! - get a better keygen library
        const keyPair = await rsa.generateKeyPairAsync(1024);
        this._PrivatePGPKey = keyPair.privateKey;
        this._PublicPGPKey = keyPair.publicKey;
        return true

    }



    public async Initialize(){

    }

    public sign(hash: string): string {
        return CrossPlatformIdentity.Crypt.signature(this._PrivatePGPKey, hash);
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
