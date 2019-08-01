import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  Container, Divider, Grid, Typography, AppBar,
  Toolbar, Button, Paper
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import RecentActorsIcon from '@material-ui/icons/RecentActors';

import ImageUploader from './ImageUploader';
import ImagePicker from './ImagePicker';

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
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  gutterBottom: {
    paddingBottom: theme.spacing(2),
  }
}));

export default function App() {
  const classes = useStyles();

  const [meme_image, setMeme_image] = useState(null);
  const [face_image, setFace_image] = useState(null);

  function onDrop(files) {
    ;
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
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom className={classes.title}>
                  Select Meme Image
                </Typography>
              </Grid>
              <Grid item xs={12} className={classes.gutterBottom}>
                <ImagePicker />
              </Grid>

              <Grid item xs={10}>
                <ImageUploader

                />
              </Grid>
            </Grid>

            <Divider variant="middle" />

            <Grid container justify='center' className={classes.section1}>
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom className={classes.title}>
                  Select Face Image to swap
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <ImageUploader

                />
              </Grid>
            </Grid>

            <Divider variant="middle" />

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