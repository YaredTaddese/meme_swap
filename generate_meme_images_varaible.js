/**
 * This code generates the necessary variable containing default meme images
 */

const fs = require('fs');

const meme_images_folder = './public/meme_images';  // folder where default meme images reside
const meme_images_exporter = './src/default_meme_images.js';    // script which export default meme images array variable

const meme_files = fs.readdirSync(meme_images_folder);

/**
 * Get file order by extracting the starting number before comma in the filename
 * @param {string} filename should start by number and comma
 */
function get_order(filename) {
    for (let i = 0;i < filename.length;i++) {
        if (filename[i] === ',') {
            return parseInt(filename.slice(0, i+1));// increment index to slice(all strings start from apostrophe(') wierd) 
        }
    }

    return null;
};

// sort files by using the numbers in the filename appropriately
meme_files.sort(function (a, b) {
    a_order = get_order(a);
    b_order = get_order(b);

    if (a_order === null) {
        if (b_order === null) return 0;
        else return -1;
    } else if (b_order === null) {
        return 1;
    } else {
        return a_order - b_order;
    }
});

// script content to be written in js file that export the default meme images variable
const exporter_content =
    `
const meme_images = ${JSON.stringify(meme_files)};
export default meme_images;
`;
fs.writeFileSync(meme_images_exporter, exporter_content);   // write script content into appropriate js file
