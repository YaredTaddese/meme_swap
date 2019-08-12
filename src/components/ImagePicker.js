import React, { useState } from 'react';

import { Grid, IconButton, Paper, Slide } from '@material-ui/core';
import LeftArrowIcon from '@material-ui/icons/ChevronLeft';
import RightArrowIcon from '@material-ui/icons/ChevronRight';

import { makeStyles } from '@material-ui/core/styles';

import meme_images from '../default_meme_images';

const useStyles = makeStyles(theme => ({
    picker_paper: {
        padding: '3px',
        backgroundColor: '#bfbfbf',
        overflow: 'hidden',
    },
    picker_image_paper: {
        height: '100px',
        cursor: 'pointer',
        transition: 'transform .2s',
        '&:hover': {
            transform: 'scale(1.1)'
        }
    },
    picker_image_grid: {
        padding: '2px',
    },
    picker_image: {
        width: '100%',
        height: '100px',
    },
}));

export default function ImagePicker(props) {
    const classes = useStyles();

    const [default_images, setDefault_images] = useState(meme_images);

    const picker_length = 3;    // number of images to be shown simultnously in the picker
    const meme_images_folder = 'meme_images/';   // folder in public directory containing default meme images for this picker

    function slide_left() {
        props.setPickerIndex(props.picker_index - 1);
    }
    function slide_right() {
        props.setPickerIndex(props.picker_index + 1);
    }

    function handleImagePick(img_path) {
        props.handleImagePick(img_path);
    }

    return (
        <Grid container alignItems="center">
            <Grid item xs={1}>
                <IconButton onClick={slide_left}
                    disabled={props.picker_index === 0}>
                    <LeftArrowIcon />
                </IconButton>
            </Grid>
            <Grid item xs>
                <Paper className={classes.picker_paper}>
                    <Grid container>
                        {
                            default_images.map((img, i) => (
                                (i >= props.picker_index && i < props.picker_index + picker_length)
                                && <Grid item xs={4} className={classes.picker_image_grid} key={i}>
                                    <Paper square className={classes.picker_image_paper}
                                        onClick={() => handleImagePick(meme_images_folder + img)}>
                                        <Slide direction={(i === props.picker_index) ? 'right' : 'left'}
                                            in={i >= props.picker_index && i < props.picker_index + picker_length}>
                                            <img src={meme_images_folder + img} className={classes.picker_image}
                                                alt='Meme' />
                                        </Slide>
                                    </Paper>
                                </Grid>
                            ))
                        }
                    </Grid>
                </Paper>
            </Grid>
            <Grid item xs={1}>
                <IconButton onClick={slide_right} disabled={props.picker_index >= default_images.length - picker_length}>
                    <RightArrowIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
}