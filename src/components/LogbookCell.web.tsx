import React from "react";
// import {Input, ListItem} from "react-native-elements";
import {StyleSheet, Text, TouchableOpacity} from "react-native";

type CellProps = {
    title:string;
    onPress:any;
    onLongPress:any;
}

type CellState = {
    editingName:boolean
    newName:string
}

export default class LogbookCell extends React.Component<CellProps,CellState> {

    state={
        editingName:false,
        newName:""
    };

    render() {
        return (
            <TouchableOpacity
                style={styles.album}
                onPress={(event => {
                    this.props.onPress();
                })}


                onLongPress={(event => {
                    this.setState({
                        editingName:true
                    })
                })}

            >
                <Text style={styles.title}>{this.props.title}</Text>
            </TouchableOpacity>
        );
    }

    onNameEditEnd(){
        this.setState({
            editingName:false
        });

        if (this.state.newName.length<1){
            this.props.onLongPress(this.props.title);
        }
        else{
            this.props.onLongPress(this.state.newName);
        }

    }

}

const styles = StyleSheet.create({
    title: {
        fontSize: 15,
        // flex:1,
        // flexWrap: 'wrap',
        alignSelf:"center",
    },
    album:{
        padding: 5,
        margin: 2,
        maxHeight: 150,
        width: 150,
    },
    image:{
        width: 105,
        height: 100,
    },

});
