import React from "react";
import { Input, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScrollView, StyleSheet, View} from "react-native";
import NativeUserPreferences from "../native/NativeUserPreferences";
import {UserPreferenceKeys} from "../shared/Constants";


type State={
    UserInfo:{[key:string]:string},
}
type Props={
}

export default class SettingsView extends React.PureComponent<Props, State> {

    state={
        UserInfo:{}
    };

    componentDidMount = async ()  => {
        const userName = (await NativeUserPreferences.Instance.GetPersistentUserPreferenceOrDefault(UserPreferenceKeys.UsersName))[0];
        const dept =  (await NativeUserPreferences.Instance.GetPersistentUserPreferenceOrDefault(UserPreferenceKeys.Department))[0];
        const imageDescription =  (await NativeUserPreferences.Instance.GetPersistentUserPreferenceOrDefault(UserPreferenceKeys.ImageDescription))[0];
        this.setState({
            UserInfo:{
                [UserPreferenceKeys.UsersName]:userName,
                [UserPreferenceKeys.Department]:dept,
                [UserPreferenceKeys.ImageDescription]:imageDescription,
            }
        });

    };


    onChangeUserSettings(key:string, value:string){
        // console.log(key,value);
        NativeUserPreferences.Instance.SetNewPersistentUserPreference(key,[value]);
    }

    render(){
        return(
            <ScrollView style={styles.container}>
            <Text h4 style={styles.title}> Settings </Text>
                {this.InputCell(UserPreferenceKeys.UsersName,"account")}
                {this.InputCell(UserPreferenceKeys.Department,"account-group")}
                {this.InputCell(UserPreferenceKeys.ImageDescription,"pencil")}
                {/*{this.InputToggle(UserPreferenceKeys.AutoSyncLogs,"sync", "sync-off")}*/}
            </ScrollView>
        )
    }


    InputCell (label:string, icon:string) {
        return (
            <View style={styles.input}>
            <Input
                placeholder={label}
                //@ts-ignore
                defaultValue={this.state.UserInfo[label]}
                label={label}
                onChangeText={text => {
                    this.onChangeUserSettings(label,text)
                }}
                leftIcon={
                    <Icon
                        name={icon}
                        size={20}
                        color='grey'
                        style={styles.icons}
                    />
                }
            />
            </View>
        );
    }

    // InputToggle (label:string, iconOn:string, iconOff:string) {
        //     return (
        //         <View style={styles.input}>
        //         <CheckBox
        //             center
        //             title={label + " : " + (this.state.syncChecked? "On":"Off ")}
        //             checkedIcon={<Icon name={iconOn} size={15} color={"black"} />}
        //             uncheckedIcon={<Icon name={iconOff} size={15} color={"red"} />}
        //             checked={this.state.syncChecked}
        //             onPress={() => {
        //                 this.onChangeUserSettings(label,String(!this.state.syncChecked));
        //                 this.setState({syncChecked: !this.state.syncChecked});
        //             }}
        //         />
        //          </View>
        //     );
        // }

}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
        padding:20,
    },
    title:{
        padding:10,
        alignSelf: "center",
    },
    icons:{
        marginLeft:-15,
        marginRight:5,
    },
    input:{
        flex: 1,
        flexDirection: 'column',
        padding:10,
    }

});
