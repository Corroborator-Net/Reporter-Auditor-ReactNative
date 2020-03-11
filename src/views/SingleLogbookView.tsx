import React from "react";
import {FlatList, RefreshControl, SafeAreaView, StyleSheet} from "react-native";
import {ImageDatabase, LogbookDatabase} from "../interfaces/Storage";
import {Log, LogbookStateKeeper} from "../interfaces/Data";
import LogCell from "../components/LogCell";

type State={
    logs:Log[]
    photos:Map<string, string>
    refreshing:boolean
}

type LogbookViewProps={
    logSource:LogbookDatabase;
    logbookStateKeeper:LogbookStateKeeper;
    imageSource:ImageDatabase;
    navigation: any;
}

export default class SingleLogbookView extends React.PureComponent<LogbookViewProps, State> {

    static LogsPerPage = 20;
    static ShouldUpdateLogbookView = false;
    previousLogLength = 0;
    previousLogbook = "";

    FlatList:any=null;
    state={
        logs:new Array<Log>(),
        photos:new Map<string, string>(),
        refreshing:false
    };


    componentDidMount(): void {
        this.FlatList = React.createRef();
        this.getLogs();
        this.props.navigation.addListener('focus', this.onScreenFocus)
    }


    // TODO: maybe add a callback to the logbook state keeper interface?
    logbookChanged() : boolean{
        return this.previousLogbook != this.props.logbookStateKeeper.CurrentLogbook
    }


    onScreenFocus = () => {
        if (this.previousLogLength < this.state.logs.length ||
            (this.logbookChanged())
        ){
            console.log("refreshing!");
            this.getLogs();
        }
        else if(SingleLogbookView.ShouldUpdateLogbookView){
            this.getLogs();
            SingleLogbookView.ShouldUpdateLogbookView = false;
        }
        this.previousLogbook = this.props.logbookStateKeeper.CurrentLogbook;
    };


    // TODO: implement pages or infinite scroll
    async getLogs(){
        const currentLogbook=this.props.logbookStateKeeper.CurrentLogbook;
        console.log("loading logs for logbook: ", currentLogbook);
        // get all of our reporters' logs - this will either be local storage or blockchain storage
        let newMap = new Map<string, string>();
        let logs = await this.props.logSource.getRecordsFor(currentLogbook);
        const photos = await this.props.imageSource.getImages(logs.slice(0,SingleLogbookView.LogsPerPage));
        photos.map((photo:string,i:number) => {
            newMap.set(logs[i].dataMultiHash, photo);
        });
        this.setState({
            logs:logs,
            photos:newMap,
        });
        this.previousLogLength = logs.length;
    }


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                        removeClippedSubviews={true}
                        ref={ (ref) => this.FlatList = ref }
                        initialNumToRender={8}
                        numColumns={2}
                        maxToRenderPerBatch={2}
                        data={this.state.logs}
                        contentContainerStyle={styles.list}
                        renderItem={({item}) =>
                            <LogCell
                                src= { `data:image/jpeg;base64,${this.state.photos.get(item.dataMultiHash)}`}
                                // {"data:image/jpeg;base64,"} // to test local-only storage on auditor side,
                                // don't pass an image
                                item={item}
                                navigation={this.props.navigation}
                            />
                        }
                        keyExtractor={item => item.dataMultiHash}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={() => this.getLogs()}/>
                        }
                />
            </SafeAreaView>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 25,
    },
    list: {
        flexDirection: 'column',
        alignItems:"center",
    },

});
