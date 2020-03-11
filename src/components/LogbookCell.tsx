import React from "react";
import {Input, ListItem} from "react-native-elements";
import { StyleSheet} from "react-native";

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
            <ListItem
                style={styles.album}
                onPress={(event => {
                    this.props.onPress();
                })}
                title={
                    this.state.editingName ?
                    <Input placeholder={"Enter a new name"}
                           onEndEditing={() =>this.onNameEditEnd()}
                           onChangeText={text=>this.setState({newName:text})}
                    />
                    :
                    this.props.title
                }
                titleStyle={styles.title}
                onLongPress={(event => {
                    this.setState({
                        editingName:true
                    })
                })}

                // leftIcon={
                //     this.props.src.length < 50 ?
                //         <></>
                //         :
                //         <Image
                //             source={{uri: this.props.src}}
                //             resizeMethod={"resize"}
                //             style={styles.image}
                //         />
                // }
            />
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