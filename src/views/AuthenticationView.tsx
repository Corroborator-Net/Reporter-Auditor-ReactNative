import React  from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {Identity} from "../interfaces/Identity";
import {LoadingSpinner, waitMS} from "../utils/Constants";

type Props = {
    identity:Identity
}
export default class AuthenticationView extends React.Component<Props,{}> {
    state = {
        status:"",
        loading:true,
    };

    componentDidMount(): void {
        this.load();
    }

    async generateAndSavePassword() {
        await waitMS(10);
        try {
            let start = new Date();

            const gotKeys = await this.props.identity.GenerateAndSavePGPKeys();
            console.log("got keys:",gotKeys);
            let end = new Date();

            this.setState({
                status: `Keys saved! takes: ${end.getTime() -
                start.getTime()} millis`,
                loading:false
            });
        } catch (err) {
            this.setState({ status: 'Could not save keys, ' + err ,
            loading:false});
        }
    }


    async load() {
        try {
            if ( await this.props.identity.LoggedIn()) {
                this.setState({  status: 'Keys loaded!',
                loading:false});
            } else {
                this.setState({ status: 'Generating your keys',
                loading:true},
                    this.generateAndSavePassword);

            }
        } catch (err) {
            this.setState({ status: 'Could not load keys. ' + err ,
            loading:false});
        }
    }



    render() {


        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>{this.state.status}</Text>
                    {this.state.loading? LoadingSpinner :<></>}
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#F5FCFF',
    },
    content: {
        marginHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '200',
        textAlign: 'center',
        marginBottom: 20,
    },

});


