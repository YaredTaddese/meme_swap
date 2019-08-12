import React, { useState, useEffect } from 'react';

import {
  Container, Divider, Grid, Typography, AppBar,
  Toolbar, Button, Paper, IconButton, CircularProgress,
  FormControl, FormControlLabel, RadioGroup, Radio, TextField
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import DownloadIcon from '@material-ui/icons/CloudDownloadOutlined';
import BackIcon from '@material-ui/icons/ArrowBack';

import ImageUploader from './components/ImageUploader';
import ImagePicker from './components/ImagePicker';

const { ImageFileIn } = require('./grpc/image_swap_pb');
const { FaceSwapClient } = require('./grpc/image_swap_grpc_web_pb');

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
  section1: { padding: theme.spacing(3, 2) },
  leftIcon: { marginRight: theme.spacing(1) },
  gutterBottom: { paddingBottom: theme.spacing(2) },
  preview_image: { maxWidth: "100%" },
  image_paper: { lineHeight: 0, },
  full_width: { width: '100%' },
  half_width: { width: '50%' },
  radio_label: { marginLeft: 0,  /* fixes some weird negative margin */ }
}));

export default function App() {
  const classes = useStyles();

  const [meme_image, setMeme_image] = useState(null);
  const [face_image, setFace_image] = useState(null);
  const [result_image, setResult_image] = useState(null);
  const [calling, setCalling] = useState(false);
  const [mode, setMode] = useState('all');
  const [upper_text, setUpper_text] = useState('');
  const [lower_text, setLower_text] = useState('');
  const [picker_index, setPicker_index] = useState(0);

  const canvasRef = React.useRef(null);
  const downloadRef = React.useRef(null);

  let file_reader = new FileReader();   // to read face image and meme image as base64

  /**
   * Swap given face image into meme image
   */
  function swapFaces() {
    setCalling(true);

    call_grpc();
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

  /**
   * Call grpc server in appropriate manner
   */
  async function call_grpc() {
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
    let client = new FaceSwapClient(process.env.REACT_APP_GRPC_HOST);

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
        let image_base64 = canvas.toDataURL('jpg');
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

  async function handleImagePick(file_path) {
    let meme = await promiseImagePathAsDataURL(file_path);
    setMeme_image(meme);
  }

  function backToHomePage() {
    setResult_image(null);
  }

  function handleModeChange(event) {
    setMode(event.target.value);
  }

  function handleUpperTextChange(event) {
    console.log('uppertext', event);
    setUpper_text(event.target.value);
  }

  function handleLowerTextChange(event) {
    setLower_text(event.target.value);
  }

  function set_up_canvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // setup image loading logic for result image
    let image = new Image();
    image.onload = function () {
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;

      // draw this image
      ctx.drawImage(this, 0, 0);

      // setup text properties
      let text_size = canvas.height * 0.12;
      ctx.font = `${text_size}px Arial`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // setup text positions
      let half_canvas_width = canvas.width / 2
      let y_margin = canvas.height * 0.08;
      let gap_x = 70;
      let gap_top = y_margin;
      let gap_bottom = canvas.height - y_margin;
      let max_width_x = canvas.width - (2 * gap_x);

      // write texts
      ctx.fillText(upper_text, half_canvas_width, gap_top, max_width_x);
      ctx.fillText(lower_text, half_canvas_width, gap_bottom, max_width_x);

      // cursor blinking logic here
      let use_cursor = false;
      if (use_cursor) { // use blinking cursor for great user exprience
        let cursor_gap = 10;
        let text_width = ctx.measureText(upper_text).width;
        let cursor_start_x = half_canvas_width + text_width / 2 + cursor_gap;
        if (cursor_start_x > max_width_x + gap_x + cursor_gap) {
          cursor_start_x = max_width_x + gap_x + cursor_gap;
        }
        ctx.fillText('|', cursor_start_x, gap_top, max_width_x - cursor_gap);
      }

      // setup downloadable content using anchor link
      downloadRef.current.href = canvas.toDataURL();
    }

    // load image from result
    image.src = result_image;
  }

  /**
   * Logic to set result image and its text on canvas whenever they change
   */
  useEffect(() => {
    if (result_image) {
      set_up_canvas();
    }
  }, [result_image, upper_text, lower_text]);

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
                <ImagePicker handleImagePick={handleImagePick} setPickerIndex={setPicker_index} 
                  picker_index={picker_index}/>
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
              <Grid item xs={12} className={`${classes.gutterBottom} ${classes.half_width}`}>
                <TextField id='upper_text' label='Top Text' margin="normal" fullWidth
                  value={upper_text} onChange={handleUpperTextChange}
                  helperText='Meme text to be at the top of the image' />
              </Grid>
              <Grid item xs={12}>
                <Paper square className={classes.image_paper}>
                  <canvas ref={canvasRef} className={classes.preview_image} />
                </Paper>
              </Grid>
              <Grid item xs={12} className={`${classes.gutterBottom} ${classes.half_width}`}>
                <TextField id='lower_text' label='Bottom Text' margin="normal" fullWidth
                  value={lower_text} onChange={handleLowerTextChange}
                  helperText='Meme text to be at the bottom of the image' />
              </Grid>

              <Grid item xs={12}>
                <Grid container justify='center'>
                  <Grid item>
                    <IconButton component='a' ref={downloadRef} href='' download='swapped_meme' color='primary'>
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