import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  Container, Divider, Grid, Typography, AppBar,
  Toolbar, Button, Paper, IconButton
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import DownloadIcon from '@material-ui/icons/CloudDownload';

import ImageUploader from './ImageUploader';
import ImagePicker from './ImagePicker';

const { ImageFileIn, ImageFileOut } = require('./image_swap_pb');
const { FaceSwapClient } = require('./image_swap_grpc_web_pb');

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
  },
  preview_image: {
    maxWidth: "100%"
  }
}));

export default function App() {
  const classes = useStyles();

  const [meme_image, setMeme_image] = useState(null);
  const [face_image, setFace_image] = useState(null);
  const [result_image, setResult_image] = useState(null);

  let file_reader = new FileReader();   // to read face image and meme image as base64

  function swapFaces() {
    test_grpc();
  }

  function crop_mime(base64_string) {
    let i = 0;
    while (base64_string[i] !== ',') {
      i++;
    }

    return base64_string.slice(i + 1);
  }

  async function test_grpc() {
    // read meme and face images as base 64
    let meme_base64 = null, face_base64 = null;

    try {
      meme_base64 = await promiseFileAsDataURL(meme_image);
      meme_base64 = crop_mime(meme_base64);
      face_base64 = await promiseFileAsDataURL(face_image);
      face_base64 = crop_mime(face_base64);
    } catch (err) {
      console.log("error while base64 reading: ", err);
    }
    console.log("meme_base64: ", meme_base64);
    console.log("face_base64: ", face_base64);
    if (!meme_base64 || !face_base64) {
      return;
    }

    // call grpc service
    let client = new FaceSwapClient('http://localhost:8080');

    let request = new ImageFileIn();
    request.setInputImage(face_base64);
    request.setMemeImage(meme_base64);

    client.faceSwap(request, {}, (err, response) => {
      if (err) {
        console.log("grpc callback error:", err);
      } else {
        console.log("response: ", response.getImageOut());
        let mime = 'data:image/jpeg;base64,';   // ! assumes server result as jpeg
        setResult_image(mime + response.getImageOut())
      }
    });
  }

  /**
   * Read input file as data_url(base64) as a promise
   * @param {input file} file read input file 
   * @returns {promise} data_url result of the file as a promise 
   */
  function promiseFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      file_reader.onerror = () => {
        file_reader.abort();
        reject(new DOMException("Problem parsing input file."));
      }

      file_reader.onloadend = () => {
        resolve(file_reader.result);
      };
      file_reader.readAsDataURL(file);
    });
  }

  function handleMemeImageUpload(file) {
    setMeme_image(file);
  }

  function handleFaceImageUpload(file) {
    setFace_image(file);
  }

  function handleImagePick(file) {
    setMeme_image(file);
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

          {!result_image && <Paper square>
            <Grid container justify='center' className={classes.section1}>
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom className={classes.title}>
                  Select Meme Image
                </Typography>
              </Grid>
              <Grid item xs={12} className={classes.gutterBottom}>
                <ImagePicker handleImagePick={handleImagePick} />
              </Grid>

              <Grid item xs={10}>
                <ImageUploader handleImageUpload={handleMemeImageUpload}
                  image={meme_image}
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
                <ImageUploader handleImageUpload={handleFaceImageUpload}

                />
              </Grid>
            </Grid>

            <Divider variant="middle" />

            <Grid container justify='center' className={classes.section1}>
              <Grid item>
                <Button variant='contained' color='primary' onClick={swapFaces}>
                  <RecentActorsIcon className={classes.leftIcon} />
                  Swap Face Image
                </Button>
              </Grid>
            </Grid>
          </Paper>}

          {result_image && <Paper square>
            <Grid container justify='center' className={classes.section1}>
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom className={classes.title}>
                  Face Swapped Meme Image
                </Typography>
              </Grid>
              <Grid item xs={12} className={classes.gutterBottom}>
                <Paper square>
                  <img src={result_image} alt='Meme' className={classes.preview_image} />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Grid container justify='center'>
                  <Grid item>
                    <IconButton>
                      <DownloadIcon />
                    </IconButton>
                  </Grid>

                </Grid>
              </Grid>
            </Grid>

          </Paper>}
        </Container>
      </MuiThemeProvider>
    </React.Fragment>
  );
}