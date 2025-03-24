import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './PlasticForm.css';
import PlasticForm from './PlasticForm.jsx';
import { Container, Typography, Paper, CircularProgress } from '@mui/material';

function App() {
  const [footprintResult, setFootprintResult] = useState(null);
  const [descriptionResult, setDescriptionResult] = useState(null); // Add state for description
  const [loading, setLoading] = useState(false);

  const handleCalculate = (footprint, description) => { // Receive description
    setLoading(false);
    setFootprintResult(footprint);
    setDescriptionResult(description); // Set the description
  };

  const handleCalculateStart = () => {
    setLoading(true);
    setFootprintResult(null);
    setDescriptionResult(null); // Reset description
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3}>
        <Typography variant="h4" align="center" gutterBottom>
          Plastic Footprint Calculator
        </Typography>
        <PlasticForm onCalculate={handleCalculate} onCalculateStart={handleCalculateStart} />
        {loading && <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}><CircularProgress /></div>}
        {footprintResult !== null && (
          <Typography variant="h6" align="center" style={{ marginTop: '20px' }}>
            Calculated Footprint: {footprintResult} kg CO2e.
            <br />
            {descriptionResult} {/* Display the dynamic description */}
            <br />
            (This is an estimate and can vary based on car type and driving conditions).
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

export default PlasticForm;