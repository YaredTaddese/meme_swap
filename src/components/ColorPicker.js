import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Popper from "@material-ui/core/Popper";
import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";

import { TwitterPicker } from "react-color";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    colored: {
        width: '32px',
        height: '18px',
        display: "flex",
    },
    swatch: {
        minWidth: 0,
        padding: '4px',
        position: 'relative',
        top: '20px'
    },
    picker: {
        background: '#e0e0e0'
    },
    material_label: {
        color: 'rgba(0,0,0,0.54)',
        fontSize: '12px',
        position: 'absolute'
    }
}));

const default_colors = [
    '#000',
    '#fff',
    '#B80000', '#DB3E00', '#FCCB00', '#008B02', '#1273DE', '#5300EB',
    '#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#C4DEF6', '#D4C4FB'
]

export default function ColorPicker(props) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);

    function handleClick(event) {
        console.log('t: ', event);
        setAnchorEl(anchorEl ? null : event.currentTarget);
    }

    function handleColorChange(color) {
        props.onColorChange(color.hex); // call parent logic

        setAnchorEl(null);  // remove picker
    }

    const open = Boolean(anchorEl);
    const id = open ? "simple-popper" : undefined;

    return (
        <div>
            <Typography variant='span' className={classes.material_label}>
                Text Color
            </Typography>
            <Button
                className={classes.swatch}
                aria-describedby={id}
                variant="contained"
                onClick={handleClick}
            >
                <div style={{ backgroundColor: props.color }} className={classes.colored} />
            </Button>
            <Popper id={id} open={open} anchorEl={anchorEl} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper>
                            <TwitterPicker color={props.color} triangle='hide'
                                onChange={handleColorChange} colors={default_colors} />
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </div>
    );
}
