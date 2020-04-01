import React  from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {Identity} from "../interfaces/Identity";
import {LoadingSpinner, waitMS} from "../shared/Constants";

type Props = {
    identity:Identity
    loggedInCallback:any
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
            const gotKeys = await this.props.identity.GenerateAndSavePGPKeys();
            console.log("got keys:",gotKeys);
            if (gotKeys) {
                this.setState({
                        status: `Keys saved!`,
                        loading: false
                    },
                    this.props.loggedInCallback(true)
                );
            }
            else{
                this.setState({ status: 'Could not save keys, using web?' ,
                    loading:false},);
            }
        } catch (err) {
            this.setState({ status: 'Could not save keys, ' + err ,
            loading:false},);
        }
    }


    async load() {
        try {
            if ( await this.props.identity.LoggedIn()) {
                this.setState({  status: 'Keys loaded!',
                loading:false},
                    this.props.loggedInCallback(true)
                );
            } else {
                this.setState({ status: 'Generating your keys, this may take a few minutes...',
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


