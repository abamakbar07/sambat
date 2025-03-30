const fs = require('fs');
const unzip = require('extract-zip');

async function extractZip() {
  try {
    await unzip('song-status.zip', { dir: __dirname });
    console.log('Extraction complete');
  } catch (err) {
    console.error('Error extracting zip:', err);
  }
}

extractZip();