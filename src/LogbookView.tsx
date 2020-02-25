import React from "react";
import {Text, View} from "react-native";
import {LogbookDatabase} from "./interfaces/Storage";
import {Log} from "./interfaces/Data";


type State={
    logs:Log[]|null
}
type Props={
    logSource:LogbookDatabase;
}

export default class LogbookView extends React.PureComponent<Props, State> {

    // constructor(props:Props){
    //     super(props);
    //
    //    this.setState({
    //        logs:null,
    //    })
    // }

    state={
        logs:null
    }

    componentDidMount(): void {
            this.getLogs();
    }

    async getLogs(){
        const logs = await this.props.logSource.getRecordsFor("666");
        this.setState({
            logs:logs
        })

    }

    renderRow(text:string) {
        return (
            <Text style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }}>
                {text}
            </Text>
        );
    }

    render() {
        // const data = [1, 2, 3, 4, 5];
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                { this.state.logs != null ?
                    <>
                        {console.log("logs: " + this.state.logs)}
                        {
                            // @ts-ignore
                            this.state.logs.map((log: Log) => {
                                return this.renderRow(log.dataMultiHash);
                            })
                        }
                    </>
                    :
                    <View/>
                }
            </View>
        );
    }

}
