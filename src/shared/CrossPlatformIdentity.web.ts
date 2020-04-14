import {Identity} from "../interfaces/Identity";
// @ts-ignore
import { RSA,Crypt } from 'hybrid-crypto-js';

export default class CrossPlatformIdentity implements Identity{

    static Crypt = new Crypt();
    // static menmonic = "ripple scissors kick mammal hire column oak again sun offer wealth tomorrow wagon turn fatal";
    // static Wallet:Wallet = Wallet.fromMnemonic(NativeDID.menmonic);
    private readonly HQPEMKey = {
        privateKey:"-----BEGIN RSA PRIVATE KEY----- MIIEowIBAAKCAQEAhFT0yrRSpuEdxRXf6Vc9nER+i+T18w1dEO4uyc45tSadtFzYfcY1jXC/f7MVdXMAawv5Qp04OdkKyEt3lrrY/xBEOKJyraGQMMKlZaMet4M1jeE+fq+nEaB7/E/XeBoSUOlG1J0o7pVVHDh7Kvs7rVQZ9FJh44MVQOWg4jmnlXLzyHRyAbyLQcSK7uwbFFebiXAZ7k+2UoSWwA9/Pagg99Nfr+AU1uZGyiPcXDzrZbCJnDdH9742QCfw5ct5l6TH2F0wJsXSGE2Ocp5O7qrzNdObB1xmlxg2XPjMUGNtgiE6c/sejpQpBulrzvcrSqiSUcvO83nF1k91dgIiGv9fLQIDAQABAoIBAGpNbM+hB3wy/p0hs1tYz49Gnnl2lfSHWamODFvkpArXWHxY0ThIDyDt34ePrr9IgJ99YOCYN2CQ785ygUC+HC7ZPFRaetDsJk5lLkR1QumcJ1swA+n05LqONss6wBYkq23/1vxYu1bc8x/WZ2rhotDb7HWN8EC5PkuBqznPosW0BP7hrY5HeHUR9hryeEcGvLyFjxdg8aa7q1W/64EgIoz1dEQU5rSjcEwZQw9F8eUsWoQni0x75kFmrrANa9gCBf8Ozbf2dQAehSH/rhJpY4eGPu1bdD4j8W8LpiGGSHVlaNowKA0KDorSBPS9ZqbBXdcvVgSnF53MxWo1LoaT1MECgYEA1ehUtwBKhKy+EVpUXE5HZsQw4Ktob3a5CcnFJrGbAicYobjmfBZoJyiK1YBvThgHzzHy7B0EvTbtT2WrHeZJnG9exmF5ypHmLAiEqk2sQroeLTdjz93HfSGifl8Z32sN2O3oV3hDUbiLOTaztz6Q0wYmMqqjiWEi4v75FMnoUgkCgYEAnl84mJaAKasjf9RUbiI3NLS92/EzYduQpNmuniLxC37aEjU2IhDwoAcBh5SeWnclaxBJtdy7WJ/6FVhZaFGtzkPtOYeAWNXzHybJhAT212FQs5L7S1rBRuVcIkod1HvSM1cOYXOcQ1cyIhtNCSVFhYE/S0q/UmxDiZc5K16E3QUCgYAJNsvHYjzTgDljt/dgToLm21abpuaFvqBz2nwikY3yxspZ1QQgnjp4TVfFoJWq0IAtnaIwJ4PXvrD0NZXsYMoU8fssInDDmAtJJEjKqTPdX/UCz5r+DjiUnElKlkAgDpV3HbBfbC/CKmfc3A1bvFcyr9YfYphOx59gFcmW6qeWOQKBgQCP6Lbk8N1E/94iKi8OZMkFe7eKRIMMSRgGtEeYKugeKga+xNuL2RjOUY9yQ/og+mNmBkb0mr8iqTv2aXHU+WOWKuNFg3t9PezOQdCbxmcHD8blZooyzyUR5xjxj6fLjThUrqbCpus3xeQoWeaGiPfDeM6q/CEeJIK6ZE/uuNTCgQKBgBNj0hU+znIu89PAL7D8z9o9UEK61RYSOtT+abgFZ5syr44B9uu6eUD9v3MqDonJh3q4WD3w4QsfdzbuhRE0zH5wS08aF1Oq0MnJyNkD8pk6J7MA6PHujNlDjPH+HiUItcNgOSo9FgtdKWvcAsdnQTI5Itr8N5LIlCfk7ZI7GbME-----END RSA PRIVATE KEY-----",
        publicKey: "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhFT0yrRSpuEdxRXf6Vc9nER+i+T18w1dEO4uyc45tSadtFzYfcY1jXC/f7MVdXMAawv5Qp04OdkKyEt3lrrY /xBEOKJyraGQMMKlZaMet4M1jeE+fq+nEaB7/E/XeBoSUOlG1J0o7pVVHDh7Kvs7rVQZ9FJh44MVQOWg4jmnlXLzyHRyAbyLQcSK7uwbFFebiXAZ7k+2UoSWwA9/Pagg99Nfr+AU1uZGyiPcXDzrZbCJnDdH9742QCfw5ct5l6TH2F0wJsXSGE2Ocp5O7qrzNdObB1xmlxg2XPjMUGNtgiE6c/sejpQpBulrzvcrSqiSUcvO83nF1k91dgIiGv9fLQIDAQAB-----END PUBLIC KEY-----"
    };

    private _PublicPGPKey:string = this.HQPEMKey.publicKey;
    private _PrivatePGPKey:string = this.HQPEMKey.privateKey;
    // TODO: commented out HQ until Atra can handle more keys
    private _TrustedPeerPGPKeys:string[] = [];

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

        this._PrivatePGPKey = this.HQPEMKey.privateKey;
        this._PublicPGPKey = this.HQPEMKey.publicKey;
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
