
// import express from 'express';
// import { Client } from '@elastic/elasticsearch';
// import cors from 'cors';
// import axios from 'axios';
// import bodyParser from 'body-parser';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const port = 4000;

// // Middleware to enable CORS and handle JSON requests
// app.use(cors({
//   origin: '*'
// }));
// app.use(bodyParser.json());
// app.use(express.static('public'));

// // Connecting to Elasticsearch
// const client = new Client({
//   node: 'http://localhost:9200',
//   auth: { username: 'elastic', password: 'elk123' } // Adjust your Elasticsearch credentials
// });

// // Welcome Route
// app.get('/', (req, res) => {
//   res.send("Welcome To Our API");
// });

// // Unified API endpoint to fetch logs from the specific index
// app.get('/api/logs', async (req, res) => {
//   const index = req.query.index || 'rrr-logs'; // Default to 'rrr-logs', or specify index in the query

//   try {
//     // Fetch logs using the Elasticsearch client
//     const result = await client.search({
//       index: index,
//       body: {
//         query: {
//           match_all: {} // Fetch all logs from the index
//         },
//         size: 50 // Limit the number of logs fetched
//       }
//     });

//     // Log the fetched logs
//     console.log("Logs fetched from Elasticsearch:", result.hits.hits);

//     // Send the fetched logs as JSON response to the frontend
//     res.json(result.hits.hits);
//   } catch (error) {
//     console.error('Error fetching logs:', error);
//     res.status(500).send('Error fetching logs');
//   }
// });


// // // API endpoint to fetch logs from the specific index
// // app.get('/search', async (req, res) => {
// //   try {
// //     const data = await axios.get("http://localhost:9200/rrr-logs/_search?pretty");
// //     res.json(data.data);
// //   } catch (error) {
// //     console.error('Error fetching logs:', error);
// //     res.status(500).send('Error fetching logs');
// //   }
// // });

// // Initialize the Google Generative AI instance
// const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// // Chatbot API endpoint

// app.get('/api/chatbot', async (req, res) => {
//   const userQuery = req.query.query;
//   console.log('Received user query:', userQuery);
//   if (!userQuery) {
//     console.log('User query is empty');
//     return res.json({ response: "I didn't understand that. Can you please clarify?" });
//   }

//   try {
//     const result = await model.generateContent(userQuery);
//     console.log('Generated response:', JSON.stringify(result, null, 2)); // Log the entire response

//     if (result && result.response && result.response.text) {
//       return res.json({ response: result.response.text() });
//     } else {
//       console.error('Unexpected response format:', result);
//       return res.status(500).json({ response: 'Unexpected response format from API.' });
//     }
//   } catch (error) {
//     console.error('Error communicating with the Generative API:', error.response?.data || error.message);
//     return res.status(500).json({ response: 'Error occurred while communicating with the API.' });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}/search?pretty`);
// });


// ==============================================================
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



dotenv.config();


// Create an Express application
const app = express();
const port = 3001; // Define the port for the server
app.use(cors({
  origin: '*'
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Middleware to enable CORS (Cross-Origin Resource Sharing)
// This allows requests from different origins (like your frontend)
// app.use(cors());
const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.POSTGRES_URL,
})
try {
  db.connect();
  console.log("pool connected ")

} catch (error) {
  console.log("Error connecting pool")
}



// Create an instance of the Elasticsearch client
const client = new Client({
  node: 'http://localhost:9200', // Use Docker service name for Elasticsearch
  auth: { username: 'elastic', password: 'elk123' } // Adjust your Elasticsearch credentials
});

// API endpoint to fetch logs from the specific index
app.get('/api/logs', async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log("Received request to fetch logs");

    // Search for logs in the specified index
    const result = await client.search({
      index: 'ram-logs', // Adjust the index pattern if necessary
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

//==================================AUTHENTICATION API===================================================
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

// Start the server and log the URL where it's running
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/api/logs`);
});

// =================== chat bot =================================

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



// ================================ new code =====================================

// const express = require('express');
// const { Client } = require('@elastic/elasticsearch');
// // const axios = require('axios');
// const cors = require('cors');

// // Create an Express application
// const app = express();
// const port = 3001; // Define the port for the server

// // Middleware to enable CORS (Cross-Origin Resource Sharing)
// // This allows requests from different origins (like your frontend)
// // app.use(cors());
// app.use(cors({
//   origin: '*'  // Allow requests from all origins, or specify frontend origin
// }));

// // Create an instance of the Elasticsearch client
// const client = new Client({
//   node: 'http://localhost:9200', // Use Docker service name for Elasticsearch
//   auth: { username: 'elastic', password: 'elk123' } // Adjust your Elasticsearch credentials
// });

// // API endpoint to fetch logs from the specific index
// app.get('/api/logs', async (req, res) => {


//   try {
//     // Log the incoming request for debugging
//     console.log("Received request to fetch logs");
//     // Search for logs in the specified index
//     const result = await client.search({
//       index: 'rrr-logs', // Adjust the index pattern if necessary
//       body: {
//         query: {
//           match_all: {} // Fetch all logs from the index
//         },
//         size: 50,
//         // _source: ["message", "@timestamp", "event.original", "tags"]

//         _source: ["message", "timestamp", "container.name", "kubernetes.pod.name", "kubernetes.namespace", "log.level"]
//       }
//     });


// console.log("Elasticsearch response:", result); // Log the entire response
// // Map the result to format the response
// const logs = result.body.hits.hits.map(hit => ({
//   message: hit._source.message,
//   timestamp: hit._source['@timestamp'],
//   // tags: hit._source.tags || [],  // Add tags if available
//   container: hit._source.container?.name || "N/A",  // Add container name
//   pod: hit._source.kubernetes?.pod?.name || "N/A",  // Add pod name
//   namespace: hit._source.kubernetes?.namespace || "N/A",  // Add namespace info
//   level: hit._source.log?.level || "info" // Add log level if available
// }));


//     res.json(logs);

//     // Log the results for debugging
//     // console.log("Logs fetched from Elasticsearch:", result.hits.hits);

//     // Send the fetched logs as a JSON response to the frontend
//     // res.json(result.hits.hits);




//   } catch (error) {
//     console.error('Error fetching logs from Elasticsearch:', error.meta.body.error || error.message);
//     console.log("Elasticsearch response body:", result.body);

//     res.status(500).send('Error fetching logs');
//   }

// });

// // Start the server and log the URL where it's running
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}/api/logs`);
// });

// ==================================== ends here ==============================================


// const express = require('express');
// const { Client } = require('@elastic/elasticsearch');
// const cors = require('cors');ld @timestamp, but wh

// const app = express();
// const port = 3000;

// // Middleware to enable CORS
// app.use(cors());

// // Connecting to Elasticsearch
// const client = new Client({
//   node: 'http://elasticsearch:9200' // for docker purposes
//   // node: 'http://host.docker.internal:9200',
//   auth: { username: 'elastic', password: 'elk123' } // Adjust your Elasticsearch credentials
// });

// // API endpoint to fetch logs from the specific index
// app.get('/search', async (req, res) => {
//   try {
//     const result = await client.search({
//       index: 'phoenix-logs', // Adjust the index pattern if necessary
//       body: {
//         query: {
//           match_all: {} // Fetch all logs from the index
//         }
//       }
//     });
//     console.log("Logs fetched from Elasticsearch:", result.hits.hits); // Log the results
//     res.json(result.hits.hits); // Send logs to frontend
//   } catch (error) {
//     console.error('Error fetching logs:', error);
//     res.status(500).send('Error fetching logs');
//   }
// });


// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}/search?pretty`);
// });

