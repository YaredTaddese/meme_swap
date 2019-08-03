import React, { useState } from "react";

import { CloudUpload, Check, Error } from "@material-ui/icons";
import { Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Dropzone from "react-dropzone";

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
    }

    function onDrop(accepted_files) {
        console.log("files: ", accepted_files);

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
                                    <CloudUpload style={{ fontSize: "48px" }} />
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
