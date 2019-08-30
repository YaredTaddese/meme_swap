import React from "react";

import UploadIcon from "@material-ui/icons/CloudUpload";
import { Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Dropzone from "react-dropzone";
import * as faceapi from "face-api.js";

const useStyles = makeStyles(theme => ({
    dropzone: {
        textAlign: "center",
        padding: "8px",
        border: "dashed 1px #90D4FF",
        cursor: "pointer",
    },
    preview_image: {
        maxWidth: "100%"
    }
}));

export default function ImageUploader(props) {
    const classes = useStyles();

    let preview_image = null;
    if (props.preview_image) {
        if (typeof props.preview_image === 'string' || props.preview_image instanceof String) {
            // assume it is image path or base64 encoded image
            preview_image = props.preview_image;
        } else {
            // assume it is image from input file
            preview_image = URL.createObjectURL(props.preview_image);
        }
        // console.log(faceapi.nets);
        const input = document.getElementById('uploadedImage');
        if(input){
            Promise.all([
                // faceapi.loadFaceRecognitionModel('./models'),
                
                // faceapi.loadFaceLandmarkModel('./models'),
                // faceapi.loadSsdMobilenetv1Model('./models')
                faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
                faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
            ]).then(start);
            // console.log(faceapi.nets.faceRecognitionNet.loadFromUri('./models'));
            function start(){
                const detections = faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors()
                console.log(detections);
            }
            // console.log(faceapi.nets);
            // faceapi.loadTinyFaceDetectorModel('https://hpssjellis.github.io/face-api.js-for-beginners/')
            // let canvas = document.createElement('canvas');
            // canvas.width = input.naturalWidth;
            // canvas.height = input.naturalHeight;

            // canvas.getContext('2d').drawImage(input, 0, 0);
            // let image_base64 = canvas.toDataURL('jpg');
            // console.log("here");
            // image = faceapi.bufferToImage(input)
            // if(faceapi.detectAllFaces(image_base64).withFaceLandmarks()){
            //   console.log(detection);
            // }
            // input.faceDetection({complete:function(faces){
            //     console.log(faces);
            // }})
      }
    }

    function onDrop(accepted_files) {
        props.handleImageUpload(accepted_files[0]);
    }

    return (
        <React.Fragment>
            <Dropzone multiple={false} onDrop={onDrop}>
                {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className={classes.dropzone}>
                        <input {...getInputProps()} />
                        {preview_image ? (
                            <Grid>
                                <img
                                    id = "uploadedImage"
                                    src={preview_image}
                                    alt="Preview"
                                    className={classes.preview_image}
                                />
                                <Typography variant="body2">
                                    Click to change the selected image
                                </Typography>
                            </Grid>
                        ) : (
                                <Grid>
                                    <UploadIcon style={{ fontSize: "48px" }} />
                                    <Typography variant="body2">
                                        Click to select an image, or drag and drop it here
                                    </Typography>
                                </Grid>
                            )}

                    </div>
                )}
            </Dropzone>
        </React.Fragment>
    );
}
