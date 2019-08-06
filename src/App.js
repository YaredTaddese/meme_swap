import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  Container, Divider, Grid, Typography, AppBar,
  Toolbar, Button, Paper, IconButton, CircularProgress,
  FormControl, FormControlLabel, RadioGroup, Radio
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import DownloadIcon from '@material-ui/icons/CloudDownloadOutlined';
import BackIcon from '@material-ui/icons/ArrowBack';

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
  },
  image_paper: {
    lineHeight: 0,
  },
  full_width: {
    width: '100%',
  },
  radio_label: {
    marginLeft: 0,  // fixes some weird negative margin
  }
}));

export default function App() {
  const classes = useStyles();

  const [meme_image, setMeme_image] = useState(null);
  const [face_image, setFace_image] = useState(null);
  const [result_image, setResult_image] = useState(null);
  const [calling, setCalling] = useState(false);
  const [mode, setMode] = useState('all');

  let file_reader = new FileReader();   // to read face image and meme image as base64

  function swapFaces() {
    setCalling(true);

    test_grpc();
  }

  /**
   * Removes image type and format description from base64 string as used in img tag src property
   * @param {string} base64_string base64 image string as used in img tag src property
   */
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
      if (typeof meme_image === 'string' || meme_image instanceof String) {
        // assume it is image path or base64 encoded image
        meme_base64 = meme_image;
      } else {
        // assume it is image from input file
        meme_base64 = await promiseFileAsDataURL(meme_image);
      }

      meme_base64 = crop_mime(meme_base64);
      face_base64 = await promiseFileAsDataURL(face_image);
      face_base64 = crop_mime(face_base64);
    } catch (err) {
      console.log("error while base64 reading: ", err);
      setCalling(false);
    }

    if (!meme_base64 || !face_base64) {
      return;
    }

    // call grpc service
    let client = new FaceSwapClient('http://localhost:8080');

    let request = new ImageFileIn();
    request.setInputImage(face_base64);
    request.setMemeImage(meme_base64);
    let grpc_mode = (mode === 'all') ? 'apply_on_all' : 'choose_largest_face';  // set appropriate mode used by grpc server
    request.setMode(grpc_mode);

    client.faceSwap(request, {}, (err, response) => {
      if (err) {
        console.log("grpc callback error:", err);
        if (err.code === 14) {
          // connection failure
        }
      } else {
        console.log("response: ", response.getImageOut());
        let mime = 'data:image/jpeg;base64,';   // ! assumes server result as jpeg
        setResult_image(mime + response.getImageOut());
      }

      setCalling(false);
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

  /**
   * Read image path as data_url(base64) as a promise
   * @param {string} image_path path of the image
   * @returns {promise} data_url result of the image as a promise 
   */
  function promiseImagePathAsDataURL(image_path) {
    return new Promise((resolve, reject) => {
      let image = new Image();

      image.onload = function () {
        let canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;

        canvas.getContext('2d').drawImage(this, 0, 0);
        let image_base64 = canvas.toDataURL();
        console.log('canvas.todataurl: ', image_base64);
        resolve(image_base64);
      }

      image.onerror = () => {
        reject(new DOMException("Problem loading image to canvas."));
      }

      image.src = image_path;
    });
  }

  function handleMemeImageUpload(file) {
    setMeme_image(file);
  }

  function handleFaceImageUpload(file) {
    setFace_image(file);
  }

  async function handleImagePick(file) {
    let meme = await promiseImagePathAsDataURL(file);
    setMeme_image(meme);
  }

  function backToHomePage() {
    setResult_image(null);
  }

  function handleModeChange(event) {
    setMode(event.target.value);
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <MuiThemeProvider theme={theme}>
        <Container maxWidth="sm">
          <AppBar position="static">
            <Toolbar>
              {
                result_image && <IconButton edge="start" color='inherit' onClick={backToHomePage}>
                  <BackIcon />
                </IconButton>
              }
              <Typography variant="h6" className={classes.title}>
                Personalized Meme Service
              </Typography>
            </Toolbar>
          </AppBar>

          {!result_image && <Paper square>
            <Grid container direction='column' alignItems='center' className={classes.section1}>
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom className={classes.title}>
                  Select Meme Image
                </Typography>
              </Grid>
              <Grid item xs={12} className={classes.gutterBottom}>
                <ImagePicker handleImagePick={handleImagePick} />
              </Grid>

              <Grid item xs={10} className={classes.full_width}>
                <ImageUploader handleImageUpload={handleMemeImageUpload}
                  preview_image={meme_image}
                />
              </Grid>
            </Grid>

            <Divider variant="middle" />

            <Grid container direction='column' alignItems='center' className={classes.section1}>
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom className={classes.title}>
                  Select Face Image to swap
                </Typography>
              </Grid>
              <Grid item xs={10} className={classes.full_width}>
                <ImageUploader handleImageUpload={handleFaceImageUpload}
                  preview_image={face_image}
                />
              </Grid>
            </Grid>

            <Divider variant="middle" />

            <Grid container direction='column' alignItems='center' className={classes.section1}>
              <Grid item align='center' xs={12} className={classes.gutterBottom}>
                <FormControl component='fieldset'>
                  <RadioGroup row
                    name="mode"
                    value={mode}
                    onChange={handleModeChange}
                  >
                    <FormControlLabel value="all" control={<Radio color='primary' />}
                      label="Swap on all faces found" className={classes.radio_label} />
                    <FormControlLabel value="largest" control={<Radio color='primary' />}
                      label="Swap on largest face only" className={classes.radio_label} />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} className={classes.gutterBottom}>
                <Button variant='contained' color='primary' onClick={swapFaces} disabled={calling}>
                  <RecentActorsIcon className={classes.leftIcon} />
                  {(calling) ? 'Swapping Face...' : 'Swap Face Image'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                {
                  calling && <CircularProgress />
                }
              </Grid>
            </Grid>
          </Paper>}

          {result_image && <Paper square>
            <Grid container direction='column' alignItems='center' className={classes.section1}>
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom className={classes.title}>
                  Face Swapped Meme Image
                </Typography>
              </Grid>
              <Grid item xs={12} className={classes.gutterBottom}>
                <Paper square className={classes.image_paper}>
                  <img src={result_image} alt='Generated Meme' className={classes.preview_image} />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Grid container justify='center'>
                  <Grid item>
                    <IconButton component='a' href={result_image} download='swapped_meme' color='primary'>
                      <DownloadIcon fontSize='large' />
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