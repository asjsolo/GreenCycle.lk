// backend/controllers/footprintController.js
import PlasticUsage from "../models/PlasticUsage.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// --- Import Node.js modules ---
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module"; // Import createRequire

// --- Import pdfmake ---
// Use the standard import for PdfPrinter if available (check pdfmake version/docs)
import PdfPrinter from "pdfmake";

// --- Get __dirname equivalent in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Initialize printer and load fonts using createRequire ---
let printer = null; // Initialize printer to null

try {
  // Find the project root directory (same logic as before)
  let currentDir = __dirname;
  let projectRoot = null;
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      projectRoot = currentDir;
      break;
    }
    currentDir = path.dirname(currentDir);
  }
  if (!projectRoot) {
    throw new Error(
      "Could not find project root (directory containing package.json)."
    );
  }

  // Construct the path to vfs_fonts.js
  const vfsFontsPath = path.join(
    projectRoot,
    "node_modules",
    "pdfmake",
    "build",
    "vfs_fonts.js"
  );
  console.log(`Attempting to load vfs_fonts from path: ${vfsFontsPath}`); // Debug log

  if (!fs.existsSync(vfsFontsPath)) {
    throw new Error(`vfs_fonts.js not found at: ${vfsFontsPath}`);
  }

  // --- Use createRequire to load the vfs_fonts.js file ---
  const require = createRequire(import.meta.url); // Create a require function relative to this module
  console.log(`Requiring vfs_fonts.js using createRequire...`);
  const vfsData = require(vfsFontsPath); // Load the file as a CommonJS module

  if (
    !vfsData ||
    typeof vfsData !== "object" ||
    Object.keys(vfsData).length === 0
  ) {
    // Add a check to ensure vfsData looks valid
    throw new Error(
      `Loaded vfs_fonts.js data seems invalid or empty. Path: ${vfsFontsPath}`
    );
  }
  console.log("vfs_fonts.js loaded successfully via require().");

  // ******** ADD THIS DEBUGGING ********
  console.log("--- Inspecting loaded vfsData ---");
  console.log("Keys found in vfsData:", Object.keys(vfsData));
  // Optionally log the first few keys to see their exact names
  console.log("First 5 keys:", Object.keys(vfsData).slice(0, 5));
  console.log("-----------------------------");
  // ******** END DEBUGGING ********

  // --- Assign the loaded VFS data to pdfmake ---
  // pdfmake relies on this static property to find fonts referenced by name in the doc definition
  PdfPrinter.vfs = vfsData;
  console.log("vfsData assigned to PdfPrinter.vfs successfully.");

  // --- Initialize the printer ---
  console.log("Defining fonts using PdfPrinter.vfs..."); // Log before defining fonts
  // Define fonts using the loaded VFS data (which is now in PdfPrinter.vfs)
  const fonts = {
    Roboto: {
      // Ensure these keys EXACTLY match the keys logged above!
      normal: Buffer.from(PdfPrinter.vfs["Roboto-Regular.ttf"], "base64"), // This line (or similar) caused the error
      bold: Buffer.from(PdfPrinter.vfs["Roboto-Medium.ttf"], "base64"),
      italics: Buffer.from(PdfPrinter.vfs["Roboto-Italic.ttf"], "base64"),
      bolditalics: Buffer.from(
        PdfPrinter.vfs["Roboto-MediumItalic.ttf"],
        "base64"
      ),
    },
    // Add other fonts if needed
  };

  // Create the printer instance
  printer = new PdfPrinter(fonts);
  console.log("PDF Printer instance created successfully.");
} catch (error) {
  console.error("FATAL ERROR during font/printer initialization:", error);
  printer = null; // Ensure printer is null on error
}

// --- Calculation Logic ---
// This function calculates the carbon footprint and points
const calculatePlasticFootprint = (
  bottles,
  bags,
  straws,
  containers,
  wrappers
) => {
  // Define CO2 emissions per item (in kg CO2e) - These are example values, refine as needed
  const bottleCO2 = 0.1;
  const bagCO2 = 0.05;
  const strawCO2 = 0.01;
  const containerCO2 = 0.2;
  const wrapperCO2 = 0.03;

  const carbonFootprint =
    bottles * bottleCO2 +
    bags * bagCO2 +
    straws * strawCO2 +
    containers * containerCO2 +
    wrappers * wrapperCO2;

  // --- Points Calculation Logic ---
  // Define a realistic MAXIMUM POSSIBLE WEEKLY CONSUMPTION for each item
  // These values are crucial for scaling the points accurately.
  // Adjust these based on research or project requirements!
  const maxBottles = 100; // Example max weekly bottles
  const maxBags = 200; // Example max weekly bags
  const maxStraws = 300; // Example max weekly straws
  const maxContainers = 50; // Example max weekly containers
  const maxWrappers = 400; // Example max weekly wrappers

  const maxCarbonFootprint =
    maxBottles * bottleCO2 +
    maxBags * bagCO2 +
    maxStraws * strawCO2 +
    maxContainers * containerCO2 +
    maxWrappers * wrapperCO2;

  // Define the maximum possible points
  const maxPoints = 100;

  // Calculate points deducted based on the proportion of carbon footprint relative to max
  // We subtract from maxPoints because higher footprint means lower score
  const pointsDeducted = (carbonFootprint / maxCarbonFootprint) * maxPoints;

  // Ensure points don't go below 0 and round to the nearest whole number
  const points = Math.max(0, Math.round(maxPoints - pointsDeducted));

  return { carbonFootprint, points };
};

// --- Controller Function for Calculation (Public) ---
// Handles the request to calculate the footprint without saving
const calculateFootprint = (req, res) => {
  const { bottles, bags, straws, containers, wrappers } = req.body;

  // Input Validation (Basic) - More robust validation can be added here
  if (
    typeof bottles !== "number" ||
    typeof bags !== "number" ||
    typeof straws !== "number" ||
    typeof containers !== "number" ||
    typeof wrappers !== "number" ||
    bottles < 0 ||
    bags < 0 ||
    straws < 0 ||
    containers < 0 ||
    wrappers < 0
  ) {
    return res.status(400).json({
      message: "Invalid input values. Please provide non-negative numbers.",
    });
  }

  const { carbonFootprint, points } = calculatePlasticFootprint(
    bottles,
    bags,
    straws,
    containers,
    wrappers
  );

  // Return the calculated results
  res.json({ success: true, carbonFootprint, points });
};

// --- Controller Function for Saving Usage (Protected) ---
// Handles the request to save the footprint for a logged-in user
const saveFootprintUsage = async (req, res) => {
  // req.user will be available because this route will be protected by userAuth middleware
  const userId = req.user._id;
  // Get the calculated data from the request body (sent from the frontend after calculation)
  const {
    bottles,
    bags,
    straws,
    containers,
    wrappers,
    carbonFootprint,
    points,
  } = req.body;

  // Basic validation - ensure required fields are present
  if (
    !userId ||
    typeof bottles !== "number" ||
    typeof bags !== "number" ||
    typeof straws !== "number" ||
    typeof containers !== "number" ||
    typeof wrappers !== "number" ||
    typeof carbonFootprint !== "number" ||
    typeof points !== "number"
  ) {
    console.error(
      "Save Footprint Usage: Missing required data or invalid types."
    );
    return res
      .status(400)
      .json({ message: "Missing required data to save usage record." });
  }

  try {
    const usageRecord = new PlasticUsage({
      userId, // Use the logged-in user's ID
      // date: is defaulted in schema
      bottles,
      bags,
      straws,
      containers,
      wrappers,
      carbonFootprint,
      points,
    });

    await usageRecord.save();
    console.log("Footprint usage record saved for user:", userId); // Debug log

    res.status(201).json({
      success: true,
      message: "Plastic usage record saved successfully!",
      record: usageRecord,
    });
  } catch (error) {
    console.error("Error saving footprint usage record:", error);
    // Check for Mongoose validation errors (e.g., if a required field was actually missing)
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while saving usage.",
    });
  }
};
// --- NEW: Controller Function to Get Footprint History (Protected) ---
// Handles fetching historical plastic usage records for the logged-in user
const getFootprintHistory = async (req, res) => {
  // req.user._id is available due to userAuth middleware
  const userId = req.user._id;

  if (!userId) {
    // This case should ideally not happen if userAuth works correctly, but good defensive check
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  try {
    console.log("Fetching footprint history for user:", userId); // Debug log
    // Find all PlasticUsage records for the user, sort by date descending
    const history = await PlasticUsage.find({ userId: userId })
      .sort({ date: 1 }) // Sort by date ascending for chart trend
      .lean(); // Use .lean() for faster query if you don't need Mongoose document methods

    console.log(`Found ${history.length} history records for user ${userId}.`); // Debug log

    res.json({ success: true, history: history });
  } catch (error) {
    console.error("Error fetching footprint history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while fetching history.",
    });
  }
};

// --- Controller: Generate Plastic Usage Report (Protected) ---
const generatePlasticReport = async (req, res) => {
  // Check if the printer was successfully initialized AND VFS is loaded
  if (!printer || !PdfPrinter.vfs) {
    console.error(
      "generatePlasticReport: PDF Printer or VFS fonts not initialized successfully."
    );
    return res.status(500).json({
      success: false,
      message:
        "Report generation service is not available due to a configuration error.",
    });
  }

  const userId = req.user._id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }

  try {
    console.log(`Generating plastic usage report for user: ${userId}`);

    const history = await PlasticUsage.find({ userId: userId })
      .sort({ date: 1 })
      .lean();

    if (history.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No plastic usage history found to generate a report.",
      });
    }

    // --- Prepare Data for the PDF ---
    const totalCarbonFootprint = history.reduce(
      (sum, record) => sum + record.carbonFootprint,
      0
    );
    const averageEcoScore =
      history.length > 0
        ? history.reduce((sum, record) => sum + record.points, 0) /
          history.length
        : 0;

    const tableBody = [
      [
        "Date",
        "Bottles",
        "Bags",
        "Straws",
        "Containers",
        "Wrappers",
        "Carbon Footprint (kg CO2e)",
        "Eco Score (/100)",
      ],
      ...history.map((record) => [
        new Date(record.date).toLocaleDateString(),
        record.bottles,
        record.bags,
        record.straws,
        record.containers,
        record.wrappers,
        record.carbonFootprint.toFixed(2),
        record.points,
      ]),
    ];

    // --- Define the PDF Document Definition ---
    const docDefinition = {
      content: [
        { text: "Plastic Usage Report", style: "header" },
        {
          text: `Report generated on: ${new Date().toLocaleDateString()}`,
          style: "subheader",
        },
        "\n",

        { text: "Summary", style: "sectionHeader" },
        {
          ul: [
            `Total Carbon Footprint (all records): ${totalCarbonFootprint.toFixed(
              2
            )} kg CO2e`,
            `Average Eco Score (all records): ${averageEcoScore.toFixed(
              2
            )} / 100`,
            `Number of records: ${history.length}`,
          ],
        },
        "\n",

        { text: "Detailed Usage Records", style: "sectionHeader" },
        // Only add table if there are records
        ...(history.length > 0
          ? [
              {
                table: {
                  headerRows: 1,
                  widths: [
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                    "*",
                    "*",
                  ],
                  body: tableBody,
                },
                layout: {
                  fillColor: function (rowIndex, node, columnIndex) {
                    return rowIndex > 0 && rowIndex % 2 === 0
                      ? "#CCCCCC"
                      : null;
                  },
                  hLineWidth: function (i, node) {
                    return i === 0 || i === node.table.body.length ? 2 : 1;
                  },
                  vLineWidth: function (i, node) {
                    return i === 0 || i === node.table.widths.length ? 2 : 1;
                  },
                  hLineColor: function (i, node) {
                    return i === 0 || i === node.table.body.length
                      ? "#000000"
                      : "#AAAAAA";
                  },
                  vLineColor: function (i, node) {
                    return i === 0 || i === node.table.widths.length
                      ? "#000000"
                      : "#AAAAAA";
                  },
                  paddingLeft: function (i, node) {
                    return 8;
                  },
                  paddingRight: function (i, node) {
                    return 8;
                  },
                  paddingTop: function (i, node) {
                    return 8;
                  },
                  paddingBottom: function (i, node) {
                    return 8;
                  },
                },
              },
            ]
          : []),
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          margin: [0, 10, 0, 5],
        },
        sectionHeader: {
          fontSize: 16,
          bold: true,
          margin: [0, 15, 0, 10],
        },
      },
      defaultStyle: {
        font: "Roboto", // Ensure 'Roboto' font is correctly loaded via vfs_fonts
      },
    };

    // --- Generate the PDF using pdfMake's createPdfKitDocument ---
    // This method is available on the Node build
    console.log("Creating PDF document..."); // Debug log
    const pdfDoc = printer.createPdfKitDocument(docDefinition); // Use the initialized printer

    // --- Send the PDF as a response ---
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="plastic_usage_report.pdf"'
    );
    pdfDoc.pipe(res);
    pdfDoc.end();

    console.log(`Plastic usage report generated and sent for user: ${userId}`);
  } catch (error) {
    console.error("Error generating plastic usage report:", error);
    // Avoid sending headers twice if pdfDoc.pipe already started
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "An error occurred while generating the report.",
      });
    }
  }
};

// --- NEW Controller: Delete Footprint Usage Record ---
export const deleteFootprintUsage = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated request
    const usageId = req.params.id; // Get the ID of the usage record from the URL parameters

    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(usageId)) {
      console.log(`Delete attempt with invalid ID format: ${usageId}`);
      return res
        .status(400)
        .json({ success: false, message: "Invalid usage record ID format." });
    }

    console.log(
      `Attempting to delete plastic usage record ${usageId} for user ${userId}`
    );

    // Find and delete the record, ensuring it belongs to the authenticated user
    const result = await PlasticUsage.deleteOne({
      _id: usageId,
      userId: userId, // Crucially verify user ownership
    });

    if (result.deletedCount === 0) {
      // If no document was deleted, it means either the ID was wrong or it didn't belong to the user
      console.log(
        `Delete failed: Record ${usageId} not found or does not belong to user ${userId}`
      );
      return res
        .status(404)
        .json({
          success: false,
          message: "Plastic usage record not found or does not belong to you.",
        });
    }

    console.log(`Successfully deleted plastic usage record: ${usageId}`);
    res
      .status(200)
      .json({
        success: true,
        message: "Plastic usage record deleted successfully.",
        deletedId: usageId,
      });
  } catch (error) {
    console.error("Error deleting plastic usage record:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "An internal server error occurred while deleting the record.",
      });
  }
};

// Export all controller functions
export {
  calculateFootprint,
  saveFootprintUsage,
  getFootprintHistory,
  generatePlasticReport,
};
