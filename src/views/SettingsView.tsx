import React from "react";
import { Input, Text, CheckBox, ListItem } from 'react-native-elements';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ScrollView, StyleSheet, View} from "react-native";

type State={
    checked:boolean
}
type Props={

}

export default class SettingsView extends React.PureComponent<Props, State> {

    UserSettings = new Map<string,string>();
    state={
        checked:false,
    }
    onChangeUserSettings(key:string, value:string){
        console.log(key,value);
    }

    render(){
        return(
            <ScrollView style={styles.container}>
            <Text h4 style={styles.title}> Settings </Text>
                {this.InputCell("Name","Name","account")}
                {this.InputCell("Department","Department","account-group")}
                {this.InputCell("Photo Details","Photo Details","folder-multiple-image")}
                <View style={styles.input}>
                    <ListItem
                        key={100}
                        title={"Logbooks"}
                        leftIcon={{ name: "view-list" }}
                        chevron
                    />
                </View>
                {this.InputToggle("Sync Data with Department","sync", "sync-off")}
            </ScrollView>
        )
    }

    InputToggle (label:string, iconOn:string, iconOff:string) {
        return (
            <View style={styles.input}>
            <CheckBox
                center
                title={label + " - " + this.state.checked}
                checkedIcon={<Icon name={iconOn} size={15} color={"black"} />}
                uncheckedIcon={<Icon name={iconOff} size={15} color={"red"} />}
                checked={this.state.checked}
                onPress={() => this.setState({checked: !this.state.checked})}
            />
             </View>
        );
    }

    InputCell ( placeholder:string, label:string, icon:string) {
        return (
            <View style={styles.input}>
            <Input
                placeholder={placeholder}
                label={label}
                onChangeText={text => {this.onChangeUserSettings(label,text)}}
                leftIcon={
                    <Icon
                        name={icon}
                        size={24}
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
