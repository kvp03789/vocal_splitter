const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const downloadAudioFromYouTube = (youtubeUrl, outputDir) => {
  return new Promise((resolve, reject) => {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate a unique filename (optional, but avoids output parsing)
    const fileName = `audio_${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, fileName);
    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${youtubeUrl}"`;

    // Execute the yt-dlp command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('yt-dlp error:', stderr);
        return reject(error);
      }

      console.log('yt-dlp output:', stdout);
      resolve(outputPath);
    });
  });
};

const uploadToLalaAi = async (filePath, licenseKey) => {
  try {
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);

    const response = await axios.post('https://www.lalal.ai/api/upload/', fileStream, {
      headers: {
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Authorization': `license ${licenseKey}`,
        'Content-Type': 'application/octet-stream',
      },
      maxBodyLength: Infinity,
    });

    if (response.data.status === 'success') {
      console.log('Upload success:', response.data);
      return response.data.id; // You’ll use this in the split step
    } else {
      console.error('Upload error:', response.data.error);
      return null;
    }
  } catch (error) {
    console.error('Error uploading file:', error.response?.data || error.message);
    return null;
  }
}

function isValidYouTubeURL(url) {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}(\?.*)?$/;
  return regex.test(url);
}




module.exports = { downloadAudioFromYouTube, uploadToLalaAi, isValidYouTubeURL };
