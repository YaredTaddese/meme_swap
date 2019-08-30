import React from 'react';

import { Snackbar, SnackbarContent, makeStyles, IconButton } from "@material-ui/core";

import ErrorIcon from '@material-ui/icons/Error';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme => ({
    error: { backgroundColor: theme.palette.error.dark },
    snackbar_message: {
        display: 'flex',
        alignItems: 'center',
    },
    error_icon: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
    snackbar_icon: { fontSize: 20 },
}));

export default function SnackBar(props) {
    const classes = useStyles();

    return <Snackbar
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        open={Boolean(props.message)}
        autoHideDuration={4000}
        onClose={props.closeSnackBar}
        ClickAwayListenerProps={{ onClickAway: props.closeSnackBar }}
    >
        <SnackbarContent
            className={classes.error}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.snackbar_message}>
                    <ErrorIcon className={`${classes.snackbar_icon} ${classes.error_icon}`} />
                    {props.message}
                </span>
            }
            action={[
                <IconButton key="close" aria-label="close" color="inherit"
                    onClick={props.closeSnackBar}>
                    <CloseIcon className={classes.snackbar_icon} />
                </IconButton>,
            ]}
        />
    </Snackbar>;
}