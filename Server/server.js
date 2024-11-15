import express from 'express';
import { Client } from '@elastic/elasticsearch';
import cors from 'cors';
import axios from 'axios';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import pg from "pg";
import bcrypt from 'bcrypt';
import fs from 'fs';



dotenv.config();


// Create an Express application
const app = express();
const port = 3001; // Define the port for the server
app.use(cors({
  origin: '*'
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Create an instance of the Elasticsearch client
const client = new Client({
  node: 'http://localhost:9200', // Use Docker service name for Elasticsearch
  auth: { username: 'elastic', password: 'elk123' } // Adjust your Elasticsearch credentials
});

// API endpoint to fetch logs from the specific index

app.get('/', (req, res) => {
  res.send("Welcome to API_")
})
app.get('/api/logs', async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log("Received request to fetch logs");

    // Search for logs in the specified index
    const result = await client.search({
      index: 'index-ok', // Adjust the index pattern if necessary
      body: {
        query: {
          match_all: {} // Fetch all logs from the index
        },
        size: 50
      }
    });

    // Log the results for debugging
    console.log("Logs fetched from Elasticsearch:", result.hits.hits);

    // Send the fetched logs as a JSON response to the frontend
    res.json(result.hits.hits);
  } catch (error) {
    // Log any error that occurs during the fetch operation
    console.error('Error fetching logs:', error);

    // Send a 500 error response to the client
    res.status(500).send('Error fetching logs');
  }
});
// ===================



// const db = new pg.Client({
//   user: "postgres",
//   host: "localhost",
//   database: "miniproject",
//   password: "db#2004",
//   port: 5432
// });
// db.connect();

const db = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
})

//==================================AUTHENTICATION API==================================================nc =

app.put('/addUser', async (req, res) => {
  try {
    const username = req.query.username;
    const password = req.query.password;
    console.log("INSIDE ADD USER");
    const saltRound = 5;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    const checkerResult = await db.query("SELECT * FROM users WHERE username=$1", [username]);
    if (checkerResult.rowCount > 0) {
      res.send({
        'success': 'no',
        'status': 'user already found'
      });
    } else {
      await db.query("INSERT INTO users(username,password) VALUES($1,$2)", [username, hashedPassword]);
      res.send({
        'success': 'yes',
        'status': "user added"
      })
    }
  } catch (error) {
    res.send({ 'error': error });
  }
});
app.get('/verifyUser', async (req, res) => {
  try {
    const inputPassword = req.query.password;
    const inputUsername = req.query.username;
    const result = await db.query("SELECT password FROM users WHERE username=$1", [inputUsername]);
    console.log(result.rows)
    if (result.rows.length === 0) {
      return res.send({ authenticate: false, "message": "User not found" });
    }
    const hashedPassword = result.rows[0].password;
    const isMatching = await bcrypt.compare(inputPassword, hashedPassword);
    res.send({ authenticate: isMatching });
  } catch (error) {
    console.error(error);
    res.status(500).send({ authenticate: false, "message": "Internal server error" });
  }
});

// // ========================================websocket code==========================================
// // Create an HTTP server and WebSocket server
// const server = app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

// const wss = new WebSocket.Server({ server });

// // Handle WebSocket connections
// wss.on('connection', (ws) => {
//   console.log("New client connected");

//   // Function to fetch logs and send to WebSocket clients
//   const fetchAndSendLogs = async () => {
//     try {
//       const result = await client.search({
//         index: 'chini-logs',
//         body: {
//           query: {
//             match_all: {}
//           },
//           size: 50
//         }
//       });

//       // Send fetched logs to all connected WebSocket clients
//       const logs = result.hits.hits;
//       const formattedLogs = logs.map(log => ({
//         id: log._id,
//         ...log._source, // Include the log data (you can customize this)
//       }));

//       // Broadcast the logs to all clients
//       wss.clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(JSON.stringify(formattedLogs));
//         }
//       });
//     } catch (error) {
//       console.error('Error fetching logs for WebSocket:', error);
//     }
//   };

//   // Send logs immediately upon connection
//   fetchAndSendLogs();

//   // Set an interval to fetch logs periodically (every 5 seconds)
//   const intervalId = setInterval(fetchAndSendLogs, 5000);

//   ws.on('close', () => {
//     console.log("Client disconnected");
//     clearInterval(intervalId); // Clear the interval when client disconnects
//   });
// });
// // ==============================websocket====================================

// app.get("/readLogsFile", (req, res) => {
//   fs.readFile('/home/chinmay/MiniProject/Github/Localhost-ELK/NetFlix/logs/error.log', 'utf-8', (err, data) => {
//     if (err) {
//       res.status(500).send("Error reading the log file." + err);
//       return;
//     }
//     const logArray = data.split('\n').filter(line => line.trim() !== '');
//     res.json(logArray);
//   });
// });
// ============================

app.get("/readLogsFile", (req, res) => {
  const mainLogPath = '/home/chinmay/MiniProject/Github/Localhost-ELK/NetFlix/logs/error.log';
  const subLogPath = '/home/chinmay/MiniProject/Github/Localhost-ELK/NetFlix/logs/access.log';

  // Use Promise.all to handle multiple file reads
  Promise.all([
    fs.promises.readFile(mainLogPath, 'utf-8'),
    fs.promises.readFile(subLogPath, 'utf-8')
  ])
    .then(([mainLogData, subLogData]) => {
      // Split and filter logs
      const mainLogArr = mainLogData.split('\n').filter(line => line.trim() !== '');
      const subLogArr = subLogData.split('\n').filter(line => line.trim() !== '');

      // Combine the arrays
      const combinedLogs = [...mainLogArr, ...subLogArr];

      // Parse and sort logs based on date and time
      const sortedLogs = combinedLogs.sort((a, b) => {
        const dateA = extractDate(a);
        const dateB = extractDate(b);
        return dateA - dateB;
      });

      // Send the sorted logs as JSON
      res.json(sortedLogs);
    })
    .catch(err => {
      // Handle errors
      res.status(500).send("Error reading the log files. " + err);
    });
});

// Function to extract date and time from a log entry
function extractDate(log) {
  // Regex to match different date formats in the logs
  const regexPatterns = [
    /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/, // Format: YYYY/MM/DD HH:MM:SS
    /\d{2}\/[A-Za-z]+\/\d{4}:\d{2}:\d{2}:\d{2}/ // Format: DD/Month/YYYY:HH:MM:SS
  ];

  for (const pattern of regexPatterns) {
    const match = log.match(pattern);
    if (match) {
      const dateString = match[0];
      if (pattern === regexPatterns[0]) {
        return new Date(dateString); // YYYY/MM/DD HH:MM:SS
      } else {
        // Convert DD/Month/YYYY:HH:MM:SS to a standard format
        return new Date(
          dateString.replace(
            /(\d{2})\/([A-Za-z]+)\/(\d{4}):(\d{2}:\d{2}:\d{2})/,
            (match, day, month, year, time) => `${year}-${getMonth(month)}-${day}T${time}`
          )
        );
      }
    }
  }
  return new Date(0); // Return a default date if no match is found
}

// Function to map month names to numbers
function getMonth(monthName) {
  const monthMap = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12'
  };
  return monthMap[monthName];
}

// =======================================


// Start the server and log the URL where it's running
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/api/logs`);
});


// =================== Chat bot =================================

// Initialize the Google Generative AI instance
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Chatbot API endpoint

app.get('/api/chatbot', async (req, res) => {
  const userQuery = req.query.query;
  console.log('Received user query:', userQuery);
  if (!userQuery) {
    console.log('User query is empty');
    return res.json({ response: "I didn't understand that. Can you please clarify?" });
  }

  try {
    const result = await model.generateContent(userQuery);
    console.log('Generated response:', JSON.stringify(result, null, 2)); // Log the entire response

    if (result && result.response && result.response.text) {
      return res.json({ response: result.response.text() });
    } else {
      console.error('Unexpected response format:', result);
      return res.status(500).json({ response: 'Unexpected response format from API.' });
    }
  } catch (error) {
    console.error('Error communicating with the Generative API:', error.response?.data || error.message);
    return res.status(500).json({ response: 'Error occurred while communicating with the API.' });
  }
});

// ==========================Chat bot ended here==============================