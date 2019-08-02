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

    const [image, setImage] = useState(null);
    const [preview_image_url, setPreview_image_url] = useState(null);

    function onDrop(accepted_files) {
        console.log("files: ", accepted_files);

        setImage(accepted_files[0]);
        setPreview_image_url(URL.createObjectURL(accepted_files[0]));
        props.handleImageUpload(accepted_files[0]);
    }

    return (
        <React.Fragment>
            <Dropzone multiple={false} onDrop={onDrop}>
                {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className={classes.dropzone}>
                        <input {...getInputProps()} />
                        {preview_image_url ? (
                            <Grid>
                                <img
                                    src={preview_image_url}
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
