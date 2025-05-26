#🧾 Example Route Descriptions
##POST /api/download
Input: { youtubeUrl: string }

Process: Uses yt-dlp to download audio → stores locally

Output: { jobId: string, audioPath: string }

POST /api/split
Input: { jobId: string, audioPath: string }

Process: Sends the audio to LALAL.AI → receives vocal/instrumental

Output: { vocalUrl: string, instrumentalUrl: string }

GET /api/result/:id
Input: jobId as route param

Output: JSON with public URLs or paths for download

DELETE /api/cleanup/:id
Input: jobId

Output: { success: true }

Purpose: Optional route to clean up server temp files (good hygiene)

GET /api/status/:id (optional)
Returns progress: "downloading", "splitting", "done", "error"