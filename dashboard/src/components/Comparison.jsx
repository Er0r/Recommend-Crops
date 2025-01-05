import React, { useState } from 'react';
import axios from 'axios';
import { Card, FileInput, Button, Alert, Title, Flex, Text } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

function Comparison() {
  // The CSV file
  const [file, setFile] = useState(null);

  // ML and DL results
  const [mlResults, setMlResults] = useState(null);
  const [dlResults, setDlResults] = useState(null);

  // Separate loading states
  const [mlProcessing, setMlProcessing] = useState(false);
  const [dlProcessing, setDlProcessing] = useState(false);

  // Error messaging
  const [errorMessage, setErrorMessage] = useState(null);

  // Update file
  const handleFileChange = (file) => {
    setFile(file);
  };

  /**
   * Convert results object to chartjs data with percentage values.
   * 
   * Expects a structure like:
   *  {
   *    "Logistic Regression": { "Accuracy": 0.92, "Precision": 0.90, ... },
   *    "Naive Bayes":         { "Accuracy": 0.88, "Precision": 0.85, ... },
   *    ...
   *  }
   */
  const prepareChartData = (resultsObj) => {
    if (!resultsObj) return { labels: [], datasets: [] };

    // Model names: e.g. ["Logistic Regression", "Naive Bayes", ...]
    const modelNames = Object.keys(resultsObj);
    if (modelNames.length === 0) return { labels: [], datasets: [] };

    // Metric names: e.g. ["Accuracy", "Precision", "Recall", "F1 Score"]
    const metricNames = Object.keys(resultsObj[modelNames[0]]);

    return {
      labels: metricNames,
      datasets: modelNames.map((model, idx) => ({
        label: model,
        // Multiply by 100 for percentages
        data: metricNames.map((m) => (resultsObj[model][m] * 100).toFixed(2)),
        backgroundColor: `rgba(${80 + idx * 40}, ${120 + idx * 30}, ${80 + idx * 20}, 0.6)`,
        borderColor: `rgba(${80 + idx * 40}, ${120 + idx * 30}, ${80 + idx * 20}, 1)`,
        borderWidth: 1,
      })),
    };
  };

  /**
   * Generate a short summary, e.g., "Best model is X with Y% accuracy."
   */
  const generateSummary = (resultsObj) => {
    if (!resultsObj) return '';

    let bestModel = '';
    let bestAccuracy = -1;

    // Find the model with highest "Accuracy"
    for (let model in resultsObj) {
      const accuracy = resultsObj[model]?.Accuracy ?? 0;
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestModel = model;
      }
    }

    // Convert to percentage
    const bestAccuracyPct = (bestAccuracy * 100).toFixed(2);
    return `The best model based on Accuracy is "${bestModel}" at ${bestAccuracyPct}%.`;
  };

  /**
   * Compare ML
   */
  const handleCompareML = async () => {
    if (!file) {
      setErrorMessage('Please select a file first.');
      return;
    }
    setErrorMessage(null);
    setMlProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // POST to /compare-ml-classifiers
      const response = await axios.post('http://localhost:5000/compare-ml-classifiers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMlResults(response.data);
    } catch (err) {
      console.error('Error comparing ML classifiers:', err);
      setErrorMessage('Error comparing ML classifiers. Please try again.');
    } finally {
      setMlProcessing(false);
    }
  };

  /**
   * Compare DL
   */
  const handleCompareDL = async () => {
    if (!file) {
      setErrorMessage('Please select a file first.');
      return;
    }
    setErrorMessage(null);
    setDlProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // POST to /compare-dl-classifiers
      const response = await axios.post('http://localhost:5000/compare-dl-classifiers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDlResults(response.data);
    } catch (err) {
      console.error('Error comparing DL classifiers:', err);
      setErrorMessage('Error comparing DL classifiers. Please try again.');
    } finally {
      setDlProcessing(false);
    }
  };

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder>
      <Title order={3} style={{ marginBottom: '1rem', textAlign: 'center' }}>
        Upload CSV File
      </Title>

      {/* File input */}
      <FileInput
        placeholder="Choose a CSV file"
        value={file}
        onChange={(file) => handleFileChange(file)}
        style={{ marginBottom: '1rem' }}
        size="md"
      />

      {/* Buttons for ML and DL with separate loading states */}
      <Flex gap="md" justify="center" align="center" style={{ marginBottom: '1rem' }}>
        <Button
          variant="gradient"
          gradient={{ from: 'teal', to: 'lime', deg: 105 }}
          disabled={!file || mlProcessing}
          loading={mlProcessing}
          onClick={handleCompareML}
        >
          Compare ML
        </Button>

        <Button
          variant="gradient"
          gradient={{ from: 'blue', to: 'violet', deg: 105 }}
          disabled={!file || dlProcessing}
          loading={dlProcessing}
          onClick={handleCompareDL}
        >
          Compare DL
        </Button>
      </Flex>

      {/* ML Results */}
      {mlResults && (
        <div style={{ marginTop: '2rem' }}>
          <Title order={4} style={{ marginBottom: '0.5rem' }}>
            ML Models Comparison
          </Title>
          <div style={{ height: 300 }}>
            <Bar
              data={prepareChartData(mlResults)}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'ML Comparison (Percentage)',
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        // Show the metric value with a '%' suffix
                        return `${context.dataset.label}: ${context.parsed.y}%`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function (value) {
                        return value + '%';
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <Text size="sm" mt="md">
            {generateSummary(mlResults)}
          </Text>
        </div>
      )}

      {/* DL Results */}
      {dlResults && (
        <div style={{ marginTop: '2rem' }}>
          <Title order={4} style={{ marginBottom: '0.5rem' }}>
            DL Models Comparison
          </Title>
          <div style={{ height: 300 }}>
            <Bar
              data={prepareChartData(dlResults)}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'DL Comparison (Percentage)',
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y}%`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function (value) {
                        return value + '%';
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <Text size="sm" mt="md">
            {generateSummary(dlResults)}
          </Text>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <Alert title="Error" color="red" style={{ marginTop: '1rem' }}>
          {errorMessage}
        </Alert>
      )}
    </Card>
  );
}

export default Comparison;
