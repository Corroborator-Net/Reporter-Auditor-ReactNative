import React from "react";
import { Input, Text, CheckBox, ListItem } from 'react-native-elements';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RefreshControl, ScrollView, StyleSheet, View} from "react-native";
import UserPreferences from "../utils/UserPreferences";
import {BlockchainInterface} from "../interfaces/BlockchainInterface";


type State={
    checked:boolean
    showLogbooks:boolean
    logbooks:string[]
    refreshingLogs:boolean
}
type Props={
    blockchainInterface:BlockchainInterface
}

export default class SettingsView extends React.PureComponent<Props, State> {


    state={
        checked:false,
        showLogbooks:false,
        logbooks:UserPreferences.UserSettingOrDefault(UserPreferences.LogbooksKey),
        refreshingLogs:false,
    };


    onChangeUserSettings(key:string, value:string){
        console.log(key,value);
        UserPreferences.CurrentUserSettings.set(key,[value]);
    }

    render(){
        return(
            <ScrollView style={styles.container}>
            <Text h4 style={styles.title}> Settings </Text>
                {this.InputCell("Name","account")}
                {this.InputCell("Department","account-group")}
                {this.InputCell(UserPreferences.CustomImageDescriptionLabel,"folder-multiple-image")}
                <ScrollView style={styles.input}>
                    <ListItem
                        key={100}
                        title={"Logbooks"}
                        leftIcon={{ name: "view-list" }}
                        chevron
                        onPress={(event => {this.setState({showLogbooks:!this.state.showLogbooks})})}
                    />
                    {this.state.showLogbooks ?
                        <ScrollView refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshingLogs}
                                onRefresh={() => this.setState({showLogbooks: true})}/>
                        }
                        >
                            { this.AddNewLogbookButton() }
                            {this.state.logbooks.map((label, i) => (
                                <ListItem
                                    key={i}
                                    title={label}
                                    titleStyle={{color: this.determineIsActive(label), fontWeight: 'bold'}}
                                    bottomDivider
                                    onPress={event => {
                                        this.onChangeUserSettings(UserPreferences.CurrentLogbookKey, label);
                                        this.setState({showLogbooks: !this.state.showLogbooks})
                                    }
                                    }
                                />))
                        }</ScrollView>
                            :
                        <></>
                    }
                </ScrollView>
                {this.InputToggle("Sync Data with Department","sync", "sync-off")}
            </ScrollView>
        )
    }

    AddNewLogbookButton():HTMLElement{
        return (<ListItem
            key={"Add New Logbook"}
            title={"Add New Logbook"}
            leftIcon={<Icon name={"plus"} size={15} color={"blue"} />}
            titleStyle={{color: "black", fontWeight: 'bold'}}
            bottomDivider
            onPress={event => {
                this.setState({refreshingLogs:true},
                this.AddNewLogbook)
            }
            }
        />)
    }

    async AddNewLogbook(){
        const response = await this.props.blockchainInterface.getNewLogbook();
        this.state.logbooks.unshift(response);
        this.setState({refreshingLogs:false})

    }

    determineIsActive(label:string){
        if ( UserPreferences.UserSettingOrDefault(UserPreferences.CurrentLogbookKey)[0] == label){
            return "green"
        }
        return "black"
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
