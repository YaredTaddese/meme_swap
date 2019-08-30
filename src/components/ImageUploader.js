import React from "react";

import UploadIcon from "@material-ui/icons/CloudUpload";
import { Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Dropzone from "react-dropzone";

const useStyles = makeStyles(theme => ({
    dropzone: {
        textAlign: "center",
        padding: "8px",
        border: "dashed 1px " + theme.palette.primary.main,
        cursor: "pointer",
    },
    error_border: {
        border: "dashed 1px" + theme.palette.error.main,
        color: theme.palette.error.main,
        '&:focus': {
            outlineColor: theme.palette.error.main,
        }
    },
    preview_image: {
        maxWidth: "100%"
    }
}));

export default function ImageUploader(props) {
    const classes = useStyles();

    let supported_images = (props.supported_files) ? props.supported_files : ['image/jpeg', 'image/jpg', 'image/png'];

    let error = false;  // assume there is no error
    let preview_image = null;
    if (props.preview_image) {
        if (typeof props.preview_image === 'string' || props.preview_image instanceof String) {
            // assume it is image path or base64 encoded image
            preview_image = props.preview_image;
        } else {
            // assume it is image from input file
            if (!isImageFile(props.preview_image)) {
                error = true;
            }
            preview_image = URL.createObjectURL(props.preview_image);
        }
    }

    function isImageFile(file) {
        return supported_images.includes(file.type);
    }

    function onDrop(accepted_files) {
        props.handleImageUpload(accepted_files[0]);
    }

    return (
        <React.Fragment>
            <Dropzone multiple={false} onDrop={onDrop}>
                {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} className={`${classes.dropzone} ${(error) ? classes.error_border : null}`}>
                        <input {...getInputProps()} />
                        {preview_image ? (
                            <Grid>
                                <img
                                    src={preview_image}
                                    alt="Preview"
                                    className={classes.preview_image}
                                />
                                <Typography variant="body2">
                                    {(error)
                                        ? 'Unsuppored file selected. Please, select an image file.'
                                        : 'Click to change the selected image'
                                    }
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
