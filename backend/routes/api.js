const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { downloadAudioFromYouTube } = require('../utils/ytDownloadHelper.js');

router.post('/download', async (req, res) => {
  const { youtubeURL } = req.body;

  if (!youtubeURL) {
    return res.status(400).json({ error: "A valid YouTube URL is required" });
  }

  try {
    const filePath = await downloadAudioFromYouTube(youtubeURL, path.resolve(__dirname, '../downloads'));

    // Stream the file to the response
    res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(filePath) + '"');
    res.setHeader('Content-Type', 'audio/mpeg');

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    // Optional: delete the file after it's been sent (see below)
    readStream.on('close', () => {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete file:', err);
        else console.log('Temporary file deleted:', filePath);
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Download failed' });
  }
});

module.exports = router