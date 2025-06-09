const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const { downloadAudioFromYouTube, isValidYouTubeURL } = require('../utils/utils.js');

const LALA_UPLOAD_API_URL = 'https://www.lalal.ai/api/upload/';
const LALA_SPLIT_API_URL = 'https://www.lalal.ai/api/split/';
const LALAL_CHECK_API_URL = 'https://www.lalal.ai/api/check/';

router.post('/download', async (req, res) => {
  const { youtubeURL } = req.body;

  if (!youtubeURL || !isValidYouTubeURL(youtubeURL)) {
    return res.status(400).json({ error: "A valid YouTube URL is required" });
  }

  try {
    const filePath = await downloadAudioFromYouTube(youtubeURL, path.resolve(__dirname, '../downloads'));
    const filename = path.basename(filePath);

    // Prepare the file stream
    const fileStream = fs.createReadStream(filePath);

    // Send to LALAL.AI as raw binary stream
    const lalalResponse = await axios.post(LALA_UPLOAD_API_URL, fileStream, {
      headers: {
        'Authorization': `license ${process.env.LALA_KEY}`,
        'Content-Disposition': `attachment; filename=${filename}`,
        'Content-Type': 'application/octet-stream',
      },
      maxBodyLength: Infinity,
    });

    //send to lala to actually split
    const splitResponse = await axios.post(
      LALA_SPLIT_API_URL,
      new URLSearchParams({
        params: JSON.stringify([
          {
            id: lalalResponse.data.id,
            stem: 'vocals', // or "piano", "drum", etc.
            // Optional: splitter: 'phoenix', dereverb_enabled: true
          }
        ])
      }),
      {
        headers: {
          'Authorization': `license ${process.env.LALA_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    // Clean up
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete temp file:', err);
      else console.log('Deleted:', filePath);
    });

    //send response
    res.json({
      success: true,
      lalalData: lalalResponse.data,
      uploadData: lalalResponse.data,
      splitTask: splitResponse.data
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Audio processing failed' });
  }
});

router.post('/check', async (req, res) => {
  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: 'taskId parameter is required' });
  }

  try {
    const formData = new URLSearchParams();
    formData.append('id', taskId);

    const checkResponse = await axios.post(LALAL_CHECK_API_URL, formData, {
      headers: {
        'Authorization': `license ${process.env.LALA_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 15000,
    });

    res.json(checkResponse.data);

  } catch (err) {
    console.error('Error checking split status:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to check split status', details: err.response?.data || err.message });
  }
});

module.exports = router;
