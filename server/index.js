const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads/');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

function executePythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn('python', [scriptPath, ...args]);

    let stdoutData = '';
    let stderrData = '';

    process.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdoutData);
      } else {
        reject(stderrData);
      }
    });
  });
}


app.post('/compare-ml-classifiers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }


    const tempFilePath = path.join(__dirname, 'uploads', `${uuidv4()}_${req.file.originalname}`);

    fs.copyFileSync(req.file.path, tempFilePath);
    const outputFilePath = path.join(__dirname, 'outputs', 'comparison_results_ml.json');
    if (!fs.existsSync(path.dirname(outputFilePath))) {
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
    }

    await executePythonScript('utils/comparison_classifiers.py', [
      tempFilePath,
      outputFilePath
    ]);

    const resultsData = fs.readFileSync(outputFilePath, 'utf-8');
    const results = JSON.parse(resultsData);


    fs.unlinkSync(tempFilePath);

    return res.json(results);
  } catch (error) {
    console.error('Error comparing ML classifiers:', error);
    return res.status(500).json({ error: 'Failed to compare ML classifiers.' });
  }
});


app.post('/compare-dl-classifiers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const tempFilePath = path.join(__dirname, 'uploads', `${uuidv4()}_${req.file.originalname}`);
    fs.copyFileSync(req.file.path, tempFilePath);

    const outputFilePath = path.join(__dirname, 'outputs', 'comparison_results_dl.json');
    if (!fs.existsSync(path.dirname(outputFilePath))) {
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
    }


    await executePythonScript('utils/comparison_dl.py', [
      tempFilePath, 
      outputFilePath
    ]);

    const resultsData = fs.readFileSync(outputFilePath, 'utf-8');
    const results = JSON.parse(resultsData);

    fs.unlinkSync(tempFilePath);

    return res.json(results);
  } catch (error) {
    console.error('Error comparing DL classifiers:', error);
    return res.status(500).json({ error: 'Failed to compare DL classifiers.' });
  }
});

app.post('/recommend-crop', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const {
      N, P, K, temperature, humidity, ph, rainfall
    } = req.body;

    const tempFilePath = path.join(__dirname, 'uploads', `${uuidv4()}_${req.file.originalname}`);
    fs.copyFileSync(req.file.path, tempFilePath);

    const scriptArgs = [
      tempFilePath,
      N,
      P,
      K,
      temperature,
      humidity,
      ph,
      rainfall
    ];

    const result = await executePythonScript('utils/recommend_crops.py', scriptArgs);
    const recommendation = JSON.parse(result);

    fs.unlinkSync(tempFilePath);

    return res.json(recommendation);
  } catch (error) {
    console.error('Error recommending crop:', error);
    return res.status(500).json({ error: 'Failed to recommend crop.' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
