import {Identity} from "../interfaces/Identity";
// @ts-ignore
import { RSA } from 'hybrid-crypto-js';
import * as Keychain from 'react-native-keychain';
import {Platform} from "react-native";
// import OpenPGP, {KeyOptions} from "react-native-fast-openpgp";


export default class NativeDID implements Identity{

    // static menmonic = "ripple scissors kick mammal hire column oak again sun offer wealth tomorrow wagon turn fatal";
    // static Wallet:Wallet = Wallet.fromMnemonic(NativeDID.menmonic);
    private readonly HQPEMKey = {
        publicKey: "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhFT0yrRSpuEdxRXf6Vc9nER+i+T18w1dEO4uyc45tSadtFzYfcY1jXC/f7MVdXMAawv5Qp04OdkKyEt3lrrY /xBEOKJyraGQMMKlZaMet4M1jeE+fq+nEaB7/E/XeBoSUOlG1J0o7pVVHDh7Kvs7rVQZ9FJh44MVQOWg4jmnlXLzyHRyAbyLQcSK7uwbFFebiXAZ7k+2UoSWwA9/Pagg99Nfr+AU1uZGyiPcXDzrZbCJnDdH9742QCfw5ct5l6TH2F0wJsXSGE2Ocp5O7qrzNdObB1xmlxg2XPjMUGNtgiE6c/sejpQpBulrzvcrSqiSUcvO83nF1k91dgIiGv9fLQIDAQAB-----END PUBLIC KEY-----"
    };

    private _PublicPGPKey:string = "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQAB-----END PUBLIC KEY-----";
    private _PrivatePGPKey:string = "-----BEGIN RSA PRIVATE KEY----- MIIEpAIBAAKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQABAoIBAQCBw9/TkfcWfzLe5/Eoj9L/rjr5c9a8QpNi3qS91Tk0WOVbZVmZcwHjZ5pW92FoFaOf/wjA2Vp7Z/xwu7ssKUBTpQuKLi6RIafy+8eZwJOXTzslzYSjNmpneKmCXlgSSaJVWoI0UIaXS/q55pi7DtJHbKpqNUDfXdp/R7opaBphgY/FKvCRbV5qUk8YGrx1mIi4Tsm1887d2NMFtihuCUVtgVtIYBDeCDGxGSUbBpsX4tDixolx+Lya+/TtLXH4zEdo1hJMBHBZdzQ6fTPRkyl/2YPs7K35pB8luGmeBYPTyL45iAFXhlT2Sx7W3SYagYPngeRe136MbapuufSnEVohAoGBAOrwlSx85S1uYQquRg0Wr9xqmpsN8yW1cv9hRfJWIlaJ18BUGFtjptTXut5QozENTnMN/fLfXw+FbcMUKc8A7Vo5AzdfEdMpaDrPyYJwOzffd7BoMeOD4ieWx9QHvJv+CR+RqONDIxCdYoqnwXXEdBfD9kOVQcyG1Tw9vjl9zTkFAoGBANtbi2P5iptSjCoHKJZutVckbk8zHMX/zAKg1pHwbCpzEirNf6bCEaRJSXwibui4mP7lMCTmhX4YfiaANXJMhq2TnerDsmMiHzhHmapkc4p3Zyrbkux2XLAm3qsV5T+1edDLG2xVI+XUzcJ20aEskzyGwROhdp5EuGf9DHYrdBjpAoGBAMc8GLUugUdiuKbPHZbR63cXbF8bmFwdIRWTTzbwdpQ+txlh93ng60TKYa1QYuQhLasCbZ4+cSX/eBKcEcx7M810VdbqJ3qUPdDKD1AvjviV6LFP2ybe27XI91NG8Fq1NtVvt/JqJ91aKov9MWGGpRDWXQv5EmC44zIABkZI+fVlAoGAQDa3Qmf9lGSA1ZjM3+S+vyjSBetPhALSxP4ycfxwnaib693GfZmYMoClu2oVD5liaFPNWTAGahhfbYPgoXoXft6UvvHU2cJWY1JKgJ/xVtqHX/txMjmf/o0SaAD74D+Oznl2qKrv3EsEhOXljgoPfAtyn/2HTOOPHBnuuPUVgmkCgYB9FGPElKHGeRxrQLePwmhul0/+vJPQLQX6umv3ZdALRFqXXZ0pIFjmQQowgQLGUOSzd91ba7KVWfcwlAIBsTlGs4Eh0g+vphYe/+fPwozs5xXTGGy7uZJOMhP/53ClknSC35+K23LsnB9RzNb/OU5W2gY+LMJw9pFum/cVg5a1eA==-----END RSA PRIVATE KEY-----";
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
        // Native code:
        // if (Platform.OS == 'android' || Platform.OS == 'ios' ) {
            // console.log("generating keys");
            // const keyOptions: KeyOptions = {
            //     hash: "sha256",
            //     RSABits: 1024,
            // };
            // const keyPair = await OpenPGP.generate({
            //     keyOptions: keyOptions
            // });
            //
            // this._PrivatePGPKey = keyPair.privateKey;
            // this._PublicPGPKey = keyPair.publicKey;

            // Here's a web version for reference
            console.log("creating rsa");
            const rsa = new RSA({rsaStandard: 'RSA-OAEP'});
            console.log("generating keys for hybrid crypto library, this may take minutes!!");
            //TODO: This takes around 2 minutes sometimes!! - get a better keygen library
            const keyPair = await rsa.generateKeyPairAsync(1024);
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
        // }




    }


    constructor() {

        // console.log("initing crypt");
        // this.crypt = new Crypt({ entropy: "hihihellooo!!!", md:'sha256' });
        // console.log("initing rsa");
        // const rsa = new RSA({ rsaStandard: 'RSA-OAEP'});
    }

    public async Initialize(){

        // Keychain.getGenericPassword()
        //     let encrypted = this.crypt.encrypt([HQPEMKey.publicKey, ReporterPEMKey.publicKey], "I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).I realise, of course, than 512 bit keys aren't a good idea. But, we support a user-choosable key size, which allows the user to choose a 512 bit key if he's stuck with a web hosting company with missing PHP modules and consequent very slow key generation (we're generating the keys in phpseclib on the back-end), which allows them to take ownership of their problem (ideally, they'd install the missing PHP modules) - and also allows for when the transport is already protected by https and they don't need a large key. (This is a WordPress plugin, and we've got to cover all the various setups people have out there).");
        //     // Decrypt encryped message with private RSA key
        // try {
        //     var decrypted1 = this.crypt.decrypt(ReporterPEMKey.privateKey, encrypted);
        // }
        // catch (e) {
        //     console.log("caught the error!", e);
        // }
        //
        //     var decrypted2 = this.crypt.decrypt(HQPEMKey.privateKey, encrypted);
        //     // console.log("decrypted1:", decrypted1.message);
        //     console.log("decrypted2message:", decrypted2.message);
        //     console.log("encrypted:", encrypted);
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