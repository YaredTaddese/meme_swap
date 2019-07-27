import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import ImageUploader from './ImageUploader';
import { Container, Divider, Grid, Typography, AppBar,
   Toolbar, Button, Paper } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from '@material-ui/core/styles';

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
      <Container maxWidth="sm">
        
        <AppBar position="static" color='primary'>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Meme Face Swap
          </Typography>
          </Toolbar>
        </AppBar>
        <Paper square>
        <Grid container justify='center' className={classes.section1}>
          <Grid item>
            <Typography variant='h6' gutterBottom>
              Select Meme Image
            </Typography>
          </Grid>
          <Grid item sm={10}>
            <ImageUploader

            />
          </Grid>
        </Grid>

        <Divider variant="middle" />

        <Grid container justify='center' className={classes.section1}>
          <Grid item>
            <Typography variant='h6' gutterBottom>
              Select Face Image to swap
            </Typography>
          </Grid>
          <Grid item sm={10}>
            <ImageUploader

            />
          </Grid>
        </Grid>
        </Paper>
      </Container>
    </React.Fragment>
  );
}