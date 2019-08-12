/**
 * This code generates the necessary variable containing default meme images
 */

const fs = require('fs');

const meme_images_folder = './public/meme_images';  // folder where default meme images reside
const meme_images_exporter = './src/default_meme_images.js';    // script which export default meme images array variable

const meme_files = fs.readdirSync(meme_images_folder);

// script content to be written in js file that export the default meme images variable 
const exporter_content =
    `
const meme_images = ${JSON.stringify(meme_files)};
export default meme_images;
`;
fs.writeFileSync(meme_images_exporter, exporter_content);   // write script content into appropriate js file