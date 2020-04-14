import {AppBar, IconButton, Toolbar, Typography} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import {SafeAreaView} from "react-native";
import React from "react";
import {useHistory} from "react-router-dom"


export default function TitleBar() {
    let history = useHistory();
    return(
        <AppBar position="static" style={{
            marginBottom:10,
            height:70,
        }}>
            <Toolbar >
                <IconButton edge="start" className={"menuButton"}
                            color="inherit"
                            aria-label="menu"
                            onClick={(e)=>
                                history.push("/")
                            }>
                    <HomeIcon/>
                </IconButton>
                <Typography variant="h6" className={"title"} style={{
                    marginLeft:20
                }}>
                    Corroborator Logs Uploader
                </Typography>
            </Toolbar>
        </AppBar>
    )
}
