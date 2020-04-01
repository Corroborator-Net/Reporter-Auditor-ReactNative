import React from "react";
import { Input, Text, CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScrollView, StyleSheet, View} from "react-native";
import NativeUserPreferences from "../native/NativeUserPreferences";
import {UserPreferenceKeys} from "../shared/Constants";


type State={
    syncChecked:boolean
}
type Props={
}

export default class SettingsView extends React.PureComponent<Props, State> {

    state={
        syncChecked:false
    };

    // componentDidMount = async ()  => {
    //     let shouldSync =
    //         (await NativeUserPreferences.Instance.GetPersistentUserPreferenceOrDefault(UserPreferenceKeys.AutoSyncLogs))[0];
    //     this.setState({
    //         syncChecked:(shouldSync == "true")
    //     })
    // };

    onChangeUserSettings(key:string, value:string){
        console.log(key,value);
        NativeUserPreferences.Instance.SetNewPersistentUserPreference(key,[value]);
    }

    render(){
        return(
            <ScrollView style={styles.container}>
            <Text h4 style={styles.title}> Settings </Text>
                {this.InputCell("Name","account")}
                {this.InputCell("Department","account-group")}
                {this.InputCell(UserPreferenceKeys.ImageDescription,"pencil")}
                {/*{this.InputToggle(UserPreferenceKeys.AutoSyncLogs,"sync", "sync-off")}*/}
            </ScrollView>
        )
    }

    InputToggle (label:string, iconOn:string, iconOff:string) {
        return (
            <View style={styles.input}>
            <CheckBox
                center
                title={label + " : " + (this.state.syncChecked? "On":"Off ")}
                checkedIcon={<Icon name={iconOn} size={15} color={"black"} />}
                uncheckedIcon={<Icon name={iconOff} size={15} color={"red"} />}
                checked={this.state.syncChecked}
                onPress={() => {
                    this.onChangeUserSettings(label,String(!this.state.syncChecked));
                    this.setState({syncChecked: !this.state.syncChecked});
                }}
            />
             </View>
        );
    }

    InputCell (label:string, icon:string) {
        return (
            <View style={styles.input}>
            <Input
                placeholder={label}
                label={label}
                onChangeText={text => {this.onChangeUserSettings(label,text)}}
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
