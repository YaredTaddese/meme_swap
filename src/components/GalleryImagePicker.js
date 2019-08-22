import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import meme_images from '../default_meme_images';

const useStyles = makeStyles(theme => ({
    gridList: {
        maxHeight: 164,
        transition: 'max-height 0.25s ease-out',
        overflowX: 'hidden',
        '&:hover': {
            // maxHeight: 3*160, //used to slide up and down
            transition: 'max-height 0.25s ease-in',
            cursor: 'pointer',
        },
    },
    tile: {
        transition: 'transform .2s',
        '&:hover': {
            transform: 'scale(1.03)'
        }
    }
}));

export default function GalleryImagePicker(props) {
    const classes = useStyles();

    const [active_memes, setActive_memes] = React.useState(meme_images.slice(0, 12));

    const grid_ref = React.createRef();
    const grid_cols = 3; // number of columns for image grid

    const padding = 2;
    const row_height = 160 + padding * 2;

    // folder in public directory containing default meme images for this picker
    const meme_images_folder = 'meme_images/';

    function slide_grid_up() {
        grid_ref.current.style['maxHeight'] = `${row_height}px`;
    }

    function slide_grid_down() {
        grid_ref.current.style['maxHeight'] = `${3 * row_height}px`;
    }

    function get_row_index() {
        return Math.round(grid_ref.current.scrollTop / row_height);
    }

    function mouse_entering(event) {
        slide_grid_down();
    }

    function mouse_leaving(event) {
        let row_index = get_row_index();
        scroll_to_row(row_index);

        slide_grid_up();
    }

    function pickImage(img_path, img_index) {
        let img_row_index = Math.floor(img_index / grid_cols);
        scroll_to_row(img_row_index);

        slide_grid_up();

        props.handleImagePick(img_path);
    }

    function scroll_to_row(row_index) {
        let new_scroll_top = row_index * row_height;
        grid_ref.current.scrollTop = new_scroll_top;
    }

    function near_grid_bottom() {
        let max_scroll_top = grid_ref.current.scrollHeight - 3 * row_height;

        return max_scroll_top - grid_ref.current.scrollTop < 2 * row_height;
    }

    function handleScroll(event) {
        if (near_grid_bottom()) {
            let row_index = get_row_index();
            let last_active_memes_index = (row_index + 1 + 5) * grid_cols;
            setActive_memes(meme_images.slice(0, last_active_memes_index));
        }
    }

    return (
        <GridList ref={grid_ref} cellHeight={160} className={classes.gridList}
            cols={grid_cols} onMouseEnter={mouse_entering}
            onMouseLeave={mouse_leaving} onScroll={handleScroll}>
            {active_memes.map((image, index) => (
                <GridListTile key={index} className={classes.tile}
                    onClick={() => pickImage(meme_images_folder + image, index)}>
                    <img src={meme_images_folder + image} alt="Meme" />
                </GridListTile>
            ))}
        </GridList>
    );
}
