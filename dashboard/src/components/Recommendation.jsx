import React, { useState } from 'react';
import axios from 'axios';
import { Card, FileInput, Button, TextInput, Alert, Title, Flex} from '@mantine/core';

function Recommendation() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [recommendation, setRecommendation] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileChange = (file) => {
    setFile(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRecommendation(null);
    setProcessing(true);
    setErrorMessage(null);

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await axios.post('http://localhost:5000/recommend-crop', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setRecommendation(response.data["Recommended Crop"]);
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Error uploading file. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card shadow="md" padding="xl" radius="md" withBorder>
      <Title order={3} style={{ marginBottom: '1rem', textAlign: 'center' }}>
        Crop Recommendation
      </Title>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <FileInput
          placeholder="Choose a CSV file"
          value={file}
          onChange={handleFileChange}
          style={{ marginBottom: '1rem' }}
          size="md"
        />
        <TextInput
          label="N"
          placeholder="N value"
          name="N"
          value={formData.N}
          onChange={handleInputChange}
          style={{ marginBottom: '1rem' }}
          required
        />
        <TextInput
          label="P"
          placeholder="P value"
          name="P"
          value={formData.P}
          onChange={handleInputChange}
          style={{ marginBottom: '1rem' }}
          required
        />
        <TextInput
          label="K"
          placeholder="K value"
          name="K"
          value={formData.K}
          onChange={handleInputChange}
          style={{ marginBottom: '1rem' }}
          required
        />
        <TextInput
          label="Temperature"
          placeholder="Temperature value"
          name="temperature"
          value={formData.temperature}
          onChange={handleInputChange}
          style={{ marginBottom: '1rem' }}
          required
        />
        <TextInput
          label="Humidity"
          placeholder="Humidity value"
          name="humidity"
          value={formData.humidity}
          onChange={handleInputChange}
          style={{ marginBottom: '1rem' }}
          required
        />
        <TextInput
          label="pH"
          placeholder="pH value"
          name="ph"
          value={formData.ph}
          onChange={handleInputChange}
          style={{ marginBottom: '1rem' }}
          required
        />
        <TextInput
          label="Rainfall"
          placeholder="Rainfall value"
          name="rainfall"
          value={formData.rainfall}
          onChange={handleInputChange}
          style={{ marginBottom: '1rem' }}
          required
        />
        <Flex justify="center">
          <Button
            type="submit"
            w={200}
            size="lg"
            variant="gradient"
            gradient={{ from: 'teal', to: 'lime', deg: 105 }}
            disabled={!file || processing}
            loaderPosition="right"
            loading={processing}
          >
            {processing ? 'Processing...' : 'Submit'}
          </Button>
        </Flex>
      </form>
      {recommendation && (
        <Alert title="Recommendation" color="green" style={{ marginTop: '1rem' }}>
          Recommended Crop: {recommendation}
        </Alert>
      )}
      {errorMessage && (
        <Alert title="Error" color="red" style={{ marginTop: '1rem' }}>
          {errorMessage}
        </Alert>
      )}
    </Card>
  );
}

export default Recommendation;
