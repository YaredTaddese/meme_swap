import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import ImageUploader from './ImageUploader';
import {
  Container, Divider, Grid, Typography, AppBar,
  Toolbar, Button, Paper, Slide
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import RecentActorsIcon from '@material-ui/icons/RecentActors';

const theme = createMuiTheme({
  palette: {
    primary: blue
  }
});

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    flexGrow: 1,
    textAlign: 'center',
  },
  section1: {
    padding: theme.spacing(3, 2),
  },
  section2: {
    padding: theme.spacing(2),
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  picker_image: {
    width: '100%',
  },
  divider: {
    backgroundColor: '#dadada',
  }
}));

export default function App() {
  const classes = useStyles();

  const [meme_image, setMeme_image] = useState(null);
  const [face_image, setFace_image] = useState(null);
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
  const default_images_length = 7;

  function onDrop(files) {
    ;
  }

  function slide_left() {
    setPicker_index(picker_index + 1);
  }
  function slide_right() {
    setPicker_index(picker_index - 1);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <MuiThemeProvider theme={theme}>
        <Container maxWidth="sm">
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" className={classes.title}>
                Personalized Meme Service
              </Typography>
            </Toolbar>
          </AppBar>

          <Paper square elevation={3}>
            <Grid container justify='center' className={classes.section1}>
              <Grid item>
                <Typography variant='h6' gutterBottom sm={12}>
                  Select Meme Image
                </Typography>
              </Grid>
              <Grid item sm={12}>
                <Grid container spacing={1}>
                  {
                    default_images.map((img, i) => (
                      (i >= picker_index && i < picker_index + picker_length)
                      && <Grid item xs={4}>
                        <Slide direction={(i === picker_index) ? 'right' : 'left'} in={i >= picker_index && i < picker_index + picker_length}>
                          <img src={img} className={classes.picker_image} />
                        </Slide>
                      </Grid>

                    ))
                  }
                  <Grid item xs={12}>
                    <Button onClick={slide_left} disabled={picker_index >= default_images_length - picker_length}>
                      Left
                    </Button>
                    <Button onClick={slide_right} disabled={picker_index === 0}>
                      Right
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item sm={10}>
                <ImageUploader

                />
              </Grid>
            </Grid>

            <Divider variant="middle" className={classes.divider} />

            <Grid container justify='center' className={classes.section1}>
              <Grid item>
                <Typography variant='h6' gutterBottom sm={12}>
                  Select Face Image to swap
                </Typography>
              </Grid>
              <Grid item sm={10}>
                <ImageUploader

                />
              </Grid>
            </Grid>

            <Divider variant="middle" className={classes.divider} />

            <Grid container justify='center' className={classes.section1}>
              <Grid item>
                <Button variant='contained' color='primary'>
                  <RecentActorsIcon className={classes.leftIcon} />
                  Swap Face Image
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </MuiThemeProvider>
    </React.Fragment>
  );
}