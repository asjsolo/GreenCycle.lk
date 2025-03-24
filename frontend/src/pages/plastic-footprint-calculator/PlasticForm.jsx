import React, { useState } from 'react';
import { TextField, Button, Grid } from '@mui/material';

function PlasticForm({ onCalculate, onCalculateStart }) {
  const [bottles, setBottles] = useState(''); // Initialize with empty string
  const [bags, setBags] = useState('');    // Initialize with empty string
  const [straws, setStraws] = useState('');  // Initialize with empty string
  const [containers, setContainers] = useState(''); // Initialize with empty string

  const handleSubmit = async (e) => {
    e.preventDefault();
    onCalculateStart();

    // Convert empty strings to 0 before sending to backend
    const bottlesValue = bottles === '' ? 0 : parseInt(bottles);
    const bagsValue = bags === '' ? 0 : parseInt(bags);
    const strawsValue = straws === '' ? 0 : parseInt(straws);
    const containersValue = containers === '' ? 0 : parseInt(containers);

    if (bottlesValue < 0 || bagsValue < 0 || strawsValue < 0 || containersValue < 0) {
      alert('Please enter non-negative values.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/calculate-footprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bottles: bottlesValue,
          bags: bagsValue,
          straws: strawsValue,
          containers: containersValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onCalculate(data.footprint, data.description);
    } catch (error) {
      console.error('Error calculating footprint:', error);
      alert('Failed to calculate footprint. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Plastic Bottles"
            type="number"
            value={bottles}
            onChange={(e) => setBottles(e.target.value)} // Allow empty string
            placeholder="0" // Placeholder text
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Plastic Bags"
            type="number"
            value={bags}
            onChange={(e) => setBags(e.target.value)} // Allow empty string
            placeholder="0" // Placeholder text
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Plastic Straws"
            type="number"
            value={straws}
            onChange={(e) => setStraws(e.target.value)} // Allow empty string
            placeholder="0" // Placeholder text
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Plastic Containers"
            type="number"
            value={containers}
            onChange={(e) => setContainers(e.target.value)} // Allow empty string
            placeholder="0" // Placeholder text
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Calculate
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default PlasticForm;