import React, { useState } from 'react';

import { Grid, IconButton, Paper, Slide } from '@material-ui/core';
import LeftArrowIcon from '@material-ui/icons/ChevronLeft';
import RightArrowIcon from '@material-ui/icons/ChevronRight';

import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

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

    const [default_images, setDefault_images] = useState([
        'images/anchorman.jpg',
        'images/aniston-sumo.jpg',
        'images/baby2.jpg',
        'images/black_and_white.jpg',
        'images/game of thrones2.jpg',
        'images/game_of_thrones3.jpg',
        'images/kalise.jpg',
    ]);
    const [picker_index, setPicker_index] = useState(0);
    const picker_length = 3;

    function slide_left() {
        setPicker_index(picker_index - 1);
    }
    function slide_right() {
        setPicker_index(picker_index + 1);
    }

    function handleImagePick(img) {
        props.handleImagePick(img);
    }

    return (
        <Grid container alignItems="center">
            <Grid item xs={1}>
                <IconButton onClick={slide_left}
                    disabled={picker_index === 0}>
                    <LeftArrowIcon />
                </IconButton>
            </Grid>
            <Grid item xs>
                <Paper className={classes.picker_paper}>
                    <Grid container>
                        {
                            default_images.map((img, i) => (
                                (i >= picker_index && i < picker_index + picker_length)
                                && <Grid item xs={4} className={classes.picker_image_grid}>
                                    <Paper square className={classes.picker_image_paper} onClick={() => handleImagePick(img)}>
                                        <Slide direction={(i === picker_index) ? 'right' : 'left'}
                                            in={i >= picker_index && i < picker_index + picker_length}>
                                            <img src={img} className={classes.picker_image}
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
                <IconButton onClick={slide_right} disabled={picker_index >= default_images.length - picker_length}>
                    <RightArrowIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
}