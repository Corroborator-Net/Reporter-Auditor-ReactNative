import {Identity} from "../interfaces/Identity";
import {HQPEMKey, ReporterPEMKey} from "../utils/Constants";
// import {ethers, Wallet} from "ethers";
// @ts-ignore
import { Crypt, RSA } from 'hybrid-crypto-js';



export default class NativeDID implements Identity{

    // static menmonic = "ripple scissors kick mammal hire column oak again sun offer wealth tomorrow wagon turn fatal";
    // static Wallet:Wallet = Wallet.fromMnemonic(NativeDID.menmonic);
    crypt:any;
    rsa:any;
    constructor() {
        // console.log(NativeDID.Wallet.address);
        // const wallet2 = Wallet.fromMnemonic(NativeDID.menmonic);
        // const address = NativeDID.Wallet.address;
        // const address2= wallet2.address;
        //
        // console.log("address1:",address, "address2:", address2);
        // NativeDID.Wallet.signMessage("bleeeblahhbloo").then((val=>{
        //     console.log("signature:",val);
        // }));
        // console.log("initing crypt");
        // this.crypt = new Crypt({ entropy: "hihihellooo!!!", md:'sha256' });
        // console.log("initing rsa");
        // this.rsa = new RSA({ rsaStandard: 'RSA-OAEP'});
    }

    public async Initialize(){
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




    addTrustedPeerAttestation(did: string): string {
        return "";
    }

    sign(base64Data: string): string {
        return "";
    }

    getMyAddress(): string {

        return "";
    }

}