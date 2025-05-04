import express from 'express';
import PlasticUsage from '../models/PlasticUsage.js'; // Import the PlasticUsage model

const router = express.Router();

router.post('/calculate', async (req, res) => {
    const { bottles, bags, straws, containers, wrappers } = req.body;

    const { carbonFootprint, points } = calculatePlasticFootprint(bottles, bags, straws, containers, wrappers);

    try {
        // Replace 'YOUR_USER_ID_HERE' with the actual user ID
        const userId = '652d8c55d143c41712a2a014'; // Replace with the actual user ID

        const usageRecord = new PlasticUsage({
            userId,
            bottles,
            bags,
            straws,
            containers,
            wrappers,
            carbonFootprint,
            points,
        });

        await usageRecord.save();

        res.json({ carbonFootprint, points });
    } catch (error) {
        console.error('Error saving usage record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

function calculatePlasticFootprint(bottles, bags, straws, containers, wrappers) {
    const bottleCO2 = 0.1;
    const bagCO2 = 0.05;
    const strawCO2 = 0.01;
    const containerCO2 = 0.2;
    const wrapperCO2 = 0.03;

    const carbonFootprint = (bottles * bottleCO2) + (bags * bagCO2) +
        (straws * strawCO2) + (containers * containerCO2) +
        (wrappers * wrapperCO2);

    // Define a MAXIMUM POSSIBLE CONSUMPTION for each item (adjust these based on a truly high baseline!)
    const maxBottles = 200;   // Even higher max
    const maxBags = 300;     // Even higher max
    const maxStraws = 500;   // Even higher max
    const maxContainers = 100; // Even higher max
    const maxWrappers = 500;  // Even higher max

    const maxCarbonFootprint = (maxBottles * bottleCO2) + (maxBags * bagCO2) +
        (maxStraws * strawCO2) + (maxContainers * containerCO2) +
        (maxWrappers * wrapperCO2);

    // Define a starting number of points for minimal impact
    const maxPoints = 100;

    // Calculate points by deducting based on the proportion of carbon footprint
    const pointsDeducted = (carbonFootprint / maxCarbonFootprint) * maxPoints;
    const points = Math.max(0, Math.round(maxPoints - pointsDeducted));

    return { carbonFootprint, points };
}

export default router;