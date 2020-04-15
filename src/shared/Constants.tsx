import {ActivityIndicator, Platform} from "react-native";
import React from "react";

export const StorageSchemaVersion = 1;

export const isMobile = Platform.OS == 'android' || Platform.OS == 'ios';

//@ts-ignore
export const waitMS = ms => new Promise(res => setTimeout(res, ms));
export function prettyPrint(message:string, data:any) { console.log(message, JSON.stringify(data, null, 2))}

export const UnfoundLogbookTitle = "Not Found";

export const LocalOnly = "orange";
export const CorroboratedUnsynced = 'yellow';
export const Synced = 'lightgreen';
export const Alarm = "red";

export const DetailLogViewName = "Details";
export const LogsViewName = "Logs";
export const EditLogsViewName = "Edit Log(s)";
export const CorroborateLogsViewNameAndID = "Uploaded Logs";

export const AppButtonTint='#459cff';

export const OriginalAlbum = "Original Corroborator Pictures";
export const ModifiedAlbum = "Modified Corroborator Pictures";

export const TestHQPEMKey={privateKey: "-----BEGIN RSA PRIVATE KEY----- MIIEpAIBAAKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQABAoIBAQCBw9/TkfcWfzLe5/Eoj9L/rjr5c9a8QpNi3qS91Tk0WOVbZVmZcwHjZ5pW92FoFaOf/wjA2Vp7Z/xwu7ssKUBTpQuKLi6RIafy+8eZwJOXTzslzYSjNmpneKmCXlgSSaJVWoI0UIaXS/q55pi7DtJHbKpqNUDfXdp/R7opaBphgY/FKvCRbV5qUk8YGrx1mIi4Tsm1887d2NMFtihuCUVtgVtIYBDeCDGxGSUbBpsX4tDixolx+Lya+/TtLXH4zEdo1hJMBHBZdzQ6fTPRkyl/2YPs7K35pB8luGmeBYPTyL45iAFXhlT2Sx7W3SYagYPngeRe136MbapuufSnEVohAoGBAOrwlSx85S1uYQquRg0Wr9xqmpsN8yW1cv9hRfJWIlaJ18BUGFtjptTXut5QozENTnMN/fLfXw+FbcMUKc8A7Vo5AzdfEdMpaDrPyYJwOzffd7BoMeOD4ieWx9QHvJv+CR+RqONDIxCdYoqnwXXEdBfD9kOVQcyG1Tw9vjl9zTkFAoGBANtbi2P5iptSjCoHKJZutVckbk8zHMX/zAKg1pHwbCpzEirNf6bCEaRJSXwibui4mP7lMCTmhX4YfiaANXJMhq2TnerDsmMiHzhHmapkc4p3Zyrbkux2XLAm3qsV5T+1edDLG2xVI+XUzcJ20aEskzyGwROhdp5EuGf9DHYrdBjpAoGBAMc8GLUugUdiuKbPHZbR63cXbF8bmFwdIRWTTzbwdpQ+txlh93ng60TKYa1QYuQhLasCbZ4+cSX/eBKcEcx7M810VdbqJ3qUPdDKD1AvjviV6LFP2ybe27XI91NG8Fq1NtVvt/JqJ91aKov9MWGGpRDWXQv5EmC44zIABkZI+fVlAoGAQDa3Qmf9lGSA1ZjM3+S+vyjSBetPhALSxP4ycfxwnaib693GfZmYMoClu2oVD5liaFPNWTAGahhfbYPgoXoXft6UvvHU2cJWY1JKgJ/xVtqHX/txMjmf/o0SaAD74D+Oznl2qKrv3EsEhOXljgoPfAtyn/2HTOOPHBnuuPUVgmkCgYB9FGPElKHGeRxrQLePwmhul0/+vJPQLQX6umv3ZdALRFqXXZ0pIFjmQQowgQLGUOSzd91ba7KVWfcwlAIBsTlGs4Eh0g+vphYe/+fPwozs5xXTGGy7uZJOMhP/53ClknSC35+K23LsnB9RzNb/OU5W2gY+LMJw9pFum/cVg5a1eA==-----END RSA PRIVATE KEY-----"
    , publicKey: "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyU/TDna0gK1rBjp6cvx9GOtuPuHgn1vY+6rYFh5ORFT4T9AiBmpABOfKCLl7u87v+CmZgJj4xnCgzz/N0s7Ts5rwuv6OZB9x+/yZDs4tfB4YnxzLDyZpS8LZe8jSQfpw11M3v/nDiInvcZOOWcrvgzVYH0RbJPznDu1HEjlDwNabCk2NI1MsrFoB9awKfJWOH3Bht5vfbbacb4YWPce2Rvn1LUkRU/U6Wa0Mu4JFGq/7z1afa6+25rXTzqVvgS6V3KxBCSTFx88D15E4UzaICYc8NqceTCbKLYZ/DsraOXNaWfsOIIN95oVXKRtJERt8qCuo1TET9mdwa4P+amVdjQIDAQAB-----END PUBLIC KEY-----"
};


export const KeysToNamesMap = {
    [TestHQPEMKey.publicKey]:"Denver PD Headquarters"
}


export const UserPreferenceKeys={
    ImageDescription:"Image Description",
    CurrentLogbook:"Current Logbook",
    Logbooks:"Logbooks",
    UsersName:"User Name",
    Department:"Department",
    // AutoSyncLogs:"Auto Sync Logs"
};

export function PrependJpegString(imageData:string):string{
return `data:image/jpeg;base64,${imageData}`;
}

export function OrdinalSuffixOf(i:number):string {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
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

export const LoadingSpinner =  <ActivityIndicator size={"large"} />;


export function makeID(length: number): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export default function fetchWithTimeout(url:string, options:any, timeout = 10000):Promise<Response> {
    //@ts-ignore
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Server Request Timeout')), timeout)
        )
    ]);
}

export function GetLocalTimeFromSeconds(seconds:number){
    let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(seconds);
    return d.toDateString()
}


export function resetOrientation(srcBase64:string, srcOrientation:number, callback:any) {
    var img = new Image();

    img.onload = function() {
        var width = img.width,
            height = img.height,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext("2d");

        // set proper canvas dimensions before transform & export
        if (4 < srcOrientation && srcOrientation < 9) {
            canvas.width = height;
            canvas.height = width;
        } else {
            canvas.width = width;
            canvas.height = height;
        }

        if (!ctx){
            return
        }
        // transform context before drawing image
        switch (srcOrientation) {
            case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
            case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
            case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
            case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
            case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
            case 7: ctx.transform(0, -1, -1, 0, height, width); break;
            case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
            default: break;
        }

        // draw image
        ctx.drawImage(img, 0, 0);

        // export base64
        callback(canvas.toDataURL('image/jpeg', 1.0));
    };

    img.src = srcBase64;
};

export function getOrientation(file:File, callback:any) {
    var reader = new FileReader();
    reader.onload = function(e) {

        //@ts-ignore
        var view = new DataView(e.target.result);
        if (view.getUint16(0, false) != 0xFFD8)
        {
            return callback(-2);
        }
        var length = view.byteLength, offset = 2;
        while (offset < length)
        {
            if (view.getUint16(offset+2, false) <= 8) return callback(-1);
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1)
            {
                if (view.getUint32(offset += 2, false) != 0x45786966)
                {
                    return callback(-1);
                }

                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++)
                {
                    if (view.getUint16(offset + (i * 12), little) == 0x0112)
                    {
                        return callback(view.getUint16(offset + (i * 12) + 8, little));
                    }
                }
            }
            else if ((marker & 0xFF00) != 0xFF00)
            {
                break;
            }
            else
            {
                offset += view.getUint16(offset, false);
            }
        }
        return callback(-1);
    };
    reader.readAsArrayBuffer(file);
}
