import {Platform} from "react-native";

export const StorageSchemaVersion = 1;
export const FirstReporterPublicKey="188f7940020dbd1bfd2841a55ec0e4f9c58af16fb216ba0af818845710463aa2";
export const HQPubKey="ba23e2b0f59d77d72367d2ab4c33fa339c6ec02e536d4a6fd4e866f94cdc14be";
export const HQPrivKey="258372658d63354eb9b87e1130b57af1f3b37463269b59ac71e5bbcfb86cfa51";
export const ReporterPrivKey="a02ccb225a841e16946ecb9ffc2ee41b7f87be652f944dd6c3e0be210da1e3c5";


//@ts-ignore
export const waitMS = ms => new Promise(res => setTimeout(res, ms));

export const LocalOnly = "orange";
export const CorroboratedUnsynced = 'yellow';
export const Synced = 'lightgreen';

export const DetailLogViewName = "Details";
export const LogsViewName = "Logs";
export const EditLogsViewName = "EditLogs";

export const AppButtonTint='#459cff';

export const OriginalAlbum = "Original Corroborator Pictures";
export const ModifiedAlbum = "Modified Corroborator Pictures";

export const UserPreferenceKeys={
    ImageDescription:"Image Description",
    CurrentLogbook:"Current Logbook",
    Logbooks:"Logbooks",
    // AutoSyncLogs:"Auto Sync Logs"
};

export function PrependJpegString(imageData:string):string{
return `data:image/jpeg;base64,${imageData}`;
}


// TODO extend to ios
export function GetPathToCameraRoll(fileName:string, original:boolean){
    let StorageLocation="file:///storage/emulated/0/Pictures/";
    if (Platform.OS == 'ios'){
        console.log("ERROR, IOS FULL PATH NOT YET TESTED")
    }
    if (original){
        StorageLocation += OriginalAlbum + "/"
    }
    else{
        StorageLocation += ModifiedAlbum + "/"
    }
    return StorageLocation +fileName;
}


export const ReporterPEMKey={privateKey: "-----BEGIN RSA PRIVATE KEY----- MIIEpAIBAAKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQABAoIBAQCBw9/TkfcWfzLe5/Eoj9L/rjr5c9a8QpNi3qS91Tk0WOVbZVmZcwHjZ5pW92FoFaOf/wjA2Vp7Z/xwu7ssKUBTpQuKLi6RIafy+8eZwJOXTzslzYSjNmpneKmCXlgSSaJVWoI0UIaXS/q55pi7DtJHbKpqNUDfXdp/R7opaBphgY/FKvCRbV5qUk8YGrx1mIi4Tsm1887d2NMFtihuCUVtgVtIYBDeCDGxGSUbBpsX4tDixolx+Lya+/TtLXH4zEdo1hJMBHBZdzQ6fTPRkyl/2YPs7K35pB8luGmeBYPTyL45iAFXhlT2Sx7W3SYagYPngeRe136MbapuufSnEVohAoGBAOrwlSx85S1uYQquRg0Wr9xqmpsN8yW1cv9hRfJWIlaJ18BUGFtjptTXut5QozENTnMN/fLfXw+FbcMUKc8A7Vo5AzdfEdMpaDrPyYJwOzffd7BoMeOD4ieWx9QHvJv+CR+RqONDIxCdYoqnwXXEdBfD9kOVQcyG1Tw9vjl9zTkFAoGBANtbi2P5iptSjCoHKJZutVckbk8zHMX/zAKg1pHwbCpzEirNf6bCEaRJSXwibui4mP7lMCTmhX4YfiaANXJMhq2TnerDsmMiHzhHmapkc4p3Zyrbkux2XLAm3qsV5T+1edDLG2xVI+XUzcJ20aEskzyGwROhdp5EuGf9DHYrdBjpAoGBAMc8GLUugUdiuKbPHZbR63cXbF8bmFwdIRWTTzbwdpQ+txlh93ng60TKYa1QYuQhLasCbZ4+cSX/eBKcEcx7M810VdbqJ3qUPdDKD1AvjviV6LFP2ybe27XI91NG8Fq1NtVvt/JqJ91aKov9MWGGpRDWXQv5EmC44zIABkZI+fVlAoGAQDa3Qmf9lGSA1ZjM3+S+vyjSBetPhALSxP4ycfxwnaib693GfZmYMoClu2oVD5liaFPNWTAGahhfbYPgoXoXft6UvvHU2cJWY1JKgJ/xVtqHX/txMjmf/o0SaAD74D+Oznl2qKrv3EsEhOXljgoPfAtyn/2HTOOPHBnuuPUVgmkCgYB9FGPElKHGeRxrQLePwmhul0/+vJPQLQX6umv3ZdALRFqXXZ0pIFjmQQowgQLGUOSzd91ba7KVWfcwlAIBsTlGs4Eh0g+vphYe/+fPwozs5xXTGGy7uZJOMhP/53ClknSC35+K23LsnB9RzNb/OU5W2gY+LMJw9pFum/cVg5a1eA==-----END RSA PRIVATE KEY-----"
    , publicKey: "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQAB-----END PUBLIC KEY-----"
}
export const HQPEMKey = {privateKey: "-----BEGIN RSA PRIVATE KEY----- MIIEowIBAAKCAQEAhFT0yrRSpuEdxRXf6Vc9nER+i+T18w1dEO4uyc45tSadtFzYfcY1jXC/f7MVdXMAawv5Qp04OdkKyEt3lrrY/xBEOKJyraGQMMKlZaMet4M1jeE+fq+nEaB7/E/XeBoSUOlG1J0o7pVVHDh7Kvs7rVQZ9FJh44MVQOWg4jmnlXLzyHRyAbyLQcSK7uwbFFebiXAZ7k+2UoSWwA9/Pagg99Nfr+AU1uZGyiPcXDzrZbCJnDdH9742QCfw5ct5l6TH2F0wJsXSGE2Ocp5O7qrzNdObB1xmlxg2XPjMUGNtgiE6c/sejpQpBulrzvcrSqiSUcvO83nF1k91dgIiGv9fLQIDAQABAoIBAGpNbM+hB3wy/p0hs1tYz49Gnnl2lfSHWamODFvkpArXWHxY0ThIDyDt34ePrr9IgJ99YOCYN2CQ785ygUC+HC7ZPFRaetDsJk5lLkR1QumcJ1swA+n05LqONss6wBYkq23/1vxYu1bc8x/WZ2rhotDb7HWN8EC5PkuBqznPosW0BP7hrY5HeHUR9hryeEcGvLyFjxdg8aa7q1W/64EgIoz1dEQU5rSjcEwZQw9F8eUsWoQni0x75kFmrrANa9gCBf8Ozbf2dQAehSH/rhJpY4eGPu1bdD4j8W8LpiGGSHVlaNowKA0KDorSBPS9ZqbBXdcvVgSnF53MxWo1LoaT1MECgYEA1ehUtwBKhKy+EVpUXE5HZsQw4Ktob3a5CcnFJrGbAicYobjmfBZoJyiK1YBvThgHzzHy7B0EvTbtT2WrHeZJnG9exmF5ypHmLAiEqk2sQroeLTdjz93HfSGifl8Z32sN2O3oV3hDUbiLOTaztz6Q0wYmMqqjiWEi4v75FMnoUgkCgYEAnl84mJaAKasjf9RUbiI3NLS92/EzYduQpNmuniLxC37aEjU2IhDwoAcBh5SeWnclaxBJtdy7WJ/6FVhZaFGtzkPtOYeAWNXzHybJhAT212FQs5L7S1rBRuVcIkod1HvSM1cOYXOcQ1cyIhtNCSVFhYE/S0q/UmxDiZc5K16E3QUCgYAJNsvHYjzTgDljt/dgToLm21abpuaFvqBz2nwikY3yxspZ1QQgnjp4TVfFoJWq0IAtnaIwJ4PXvrD0NZXsYMoU8fssInDDmAtJJEjKqTPdX/UCz5r+DjiUnElKlkAgDpV3HbBfbC/CKmfc3A1bvFcyr9YfYphOx59gFcmW6qeWOQKBgQCP6Lbk8N1E/94iKi8OZMkFe7eKRIMMSRgGtEeYKugeKga+xNuL2RjOUY9yQ/og+mNmBkb0mr8iqTv2aXHU+WOWKuNFg3t9PezOQdCbxmcHD8blZooyzyUR5xjxj6fLjThUrqbCpus3xeQoWeaGiPfDeM6q/CEeJIK6ZE/uuNTCgQKBgBNj0hU+znIu89PAL7D8z9o9UEK61RYSOtT+abgFZ5syr44B9uu6eUD9v3MqDonJh3q4WD3w4QsfdzbuhRE0zH5wS08aF1Oq0MnJyNkD8pk6J7MA6PHujNlDjPH+HiUItcNgOSo9FgtdKWvcAsdnQTI5Itr8N5LIlCfk7ZI7GbME-----END RSA PRIVATE KEY-----",
    publicKey: "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhFT0yrRSpuEdxRXf6Vc9nER+i+T18w1dEO4uyc45tSadtFzYfcY1jXC/f7MVdXMAawv5Qp04OdkKyEt3lrrY /xBEOKJyraGQMMKlZaMet4M1jeE+fq+nEaB7/E/XeBoSUOlG1J0o7pVVHDh7Kvs7rVQZ9FJh44MVQOWg4jmnlXLzyHRyAbyLQcSK7uwbFFebiXAZ7k+2UoSWwA9/Pagg99Nfr+AU1uZGyiPcXDzrZbCJnDdH9742QCfw5ct5l6TH2F0wJsXSGE2Ocp5O7qrzNdObB1xmlxg2XPjMUGNtgiE6c/sejpQpBulrzvcrSqiSUcvO83nF1k91dgIiGv9fLQIDAQAB-----END PUBLIC KEY-----"
}

export const PeerKeyMap={
    [ReporterPEMKey.publicKey]:ReporterPEMKey.privateKey,
    [HQPEMKey.publicKey]:HQPEMKey.privateKey
}
