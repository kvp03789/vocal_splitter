const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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

module.exports = { downloadAudioFromYouTube };
