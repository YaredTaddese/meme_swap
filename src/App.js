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
import Checkbox from '@material-ui/core/Checkbox';

import ImageUploader from './components/ImageUploader';
import ColorPicker from './components/ColorPicker';
import GalleryImagePicker from './components/GalleryImagePicker';
import SnackBar from './components/SnackBar';

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
  content_center: { justifyContent: 'center' },
  radio_label: { marginLeft: 0,  /* fixes some weird negative margin */ },
  material_label: {
    color: 'rgba(0,0,0,0.54)',
    fontSize: '12px',
    position: 'absolute'
  },

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
  const [text_color, setPicker_color] = useState('white');  // text color picker state
  const [text_size, setText_size] = useState(2);
  const [error_message, setError_message] = useState('');
  const [bold_chekcked, setBold_cheked] = useState(false);
  const canvasRef = React.useRef(null);
  const downloadRef = React.useRef(null);

  let file_reader = new FileReader();   // to read face image and meme image as base64
  let supported_files = ['image/jpeg', 'image/jpg', 'image/png'];

  /**
   * Swap given face image into meme image
   */
  function swapFaces() {
    if (meme_image == null) {
      showSnackBar('No meme image is selected.')
    } else if (face_image == null) {
      showSnackBar('No input face image is selected.');
    } else {
      call_grpc();
    }
  }

  /**
   * Removes image type and format description from base64 string as used in img tag src property
   * @param {string} base64_string base64 image string as used in img tag src property
   */
  function crop_mime(base64_string) {
    if (!base64_string) return null;

    let i = 0;
    while (base64_string[i] !== ',') {
      i++;
    }

    return base64_string.slice(i + 1);
  }

  /**
   * Check if selected file is valid for processing
   * @param {File} file input file selected by user
   */
  function valid_file(file) {
    return supported_files.includes(file.type);
  }

  /**
   * Convert given image to base64 ready to be used for grpc purposes
   * @param {string || File} image image to be converted to base64 string with no mime start
   * @param {string} image_name name of image used when referring image in error messages
   */
  async function get_image_base64(image, image_name) {
    let image_base64 = null;

    if (typeof image === 'string' || image instanceof String) {
      // assume it is base64 encoded image
      image_base64 = image;
    } else {
      // assume it is image from file input selected by user
      if (!valid_file(image)) {
        showSnackBar(`Unsupported file for ${image_name} image input selected.`);
      } else {
        try {
          image_base64 = await promiseFileAsDataURL(image);
        } catch (err) {
          showSnackBar(`Error while reading ${image_name} image input. Check if appropriate file are selected.`);
          console.log("error while base64 reading: ", err);
        }
      }
    }

    image_base64 = crop_mime(image_base64);

    return image_base64;
  }

  /**
   * Call grpc server in appropriate manner
   */
  async function call_grpc() {
    setCalling(true);

    // read meme and face images as base 64
    let meme_base64 = await get_image_base64(meme_image, 'meme');
    let face_base64 = await get_image_base64(face_image, 'face');
    if (!meme_base64 || !face_base64) {
      setCalling(false);
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
      // err and response both are returned mutually exclusively(wierd)
      if (err) {
        console.log("grpc callback error:", err);
        if (err.code === 14) {
          // connection failure
          showSnackBar('Could not connect to server. Please, check your connection.');
        } else if (err.code === 2) {
          // uncatched exception from server implementation
          showSnackBar('Server Error. Please, try again.');
        } else if (err.message) {
          // custom server exception with message from grpc implementation
          showSnackBar(err.message);
          console.log("custom exception: ", err.message);
        }
      }

      if (response && response.getImageOut()) {
        let mime = 'data:image/jpeg;base64,';   // ! assumes server result as jpeg
        setResult_image(mime + response.getImageOut());
      } else {// when there is error, empty response is sent
        console.log('warning: empty response from server');
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
    setUpper_text(event.target.value);
  }

  function handleLowerTextChange(event) {
    setLower_text(event.target.value);
  }

  function handleBoldCheked(event) {
    setBold_cheked(bold_chekcked ? false : true);
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
      let canvas_text_size = canvas.height * 0.05 * text_size;
      let canvas_bold_property = `${bold_chekcked ? 'bold' : ''}`;
      ctx.font = `${canvas_bold_property} ${canvas_text_size}px Arial`;
      ctx.fillStyle = text_color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // setup text positions
      let half_canvas_width = canvas.width / 2
      let y_margin = canvas.height * 0.05 + canvas_text_size / 2;
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
  }, [result_image, upper_text, lower_text, bold_chekcked, text_color, text_size]);

  /**
   * Changes color of text that will be used to write on meme image canvas
   * @param {css color value} color new changed color from color picker component
   */
  function handleColorChange(color) {
    setPicker_color(color);
  }

  function handleTextSizeChange(event) {
    setText_size(event.target.value);
  }

  function closeSnackBar(event) {
    setError_message('');
  }

  function showSnackBar(message) {
    setError_message(message);
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
                <GalleryImagePicker handleImagePick={handleImagePick} />
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
              <Grid item xs={12} className={classes.gutterBottom}>
                <FormControl component='fieldset'>
                  <RadioGroup row className={classes.content_center}
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
              <Grid item xs={12} className={classes.half_width}>
                <Grid container>
                  <Grid item xs={4}>
                    <ColorPicker onColorChange={handleColorChange} color={text_color} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      id="text_size"
                      label="Text Size"
                      className={classes.textField}
                      type="number"
                      value={text_size}
                      onChange={handleTextSizeChange}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <div>
                    <FormControlLabel
                      control={<Checkbox onClick={handleBoldCheked} color="primary" />}
                      checked = {bold_chekcked}
                      labelPlacement="top"
                      label="bold"
                    />
                    </div>
                  </Grid>
                </Grid>
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

          <SnackBar message={error_message} closeSnackBar={closeSnackBar} />
        </Container>
      </MuiThemeProvider>
    </React.Fragment>
  );
}