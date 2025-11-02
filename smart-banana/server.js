const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();

// Landing route: serve a simple welcome message
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Banana Disease Prediction API</h1>
    <p>To get a prediction, POST an image to <code>/predict</code> using form-data with the key <code>file</code>.</p>
  `);
});

// Configure multer to store files in an "uploads" folder
const upload = multer({ dest: 'uploads/' });

app.post('/predict', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Full path to the uploaded file
  const imagePath = path.join(__dirname, req.file.path);

  // Spawn the Python process to run our predict.py script
  const pythonProcess = spawn('python', ['predict.py', imagePath]);

  let dataString = '';

  // Capture stdout data from Python
  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    // Optionally remove the uploaded file after processing
    fs.unlink(imagePath, (err) => {
      if (err) console.error(`Error removing file: ${err}`);
    });

    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Error parsing Python output', raw: dataString });
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
