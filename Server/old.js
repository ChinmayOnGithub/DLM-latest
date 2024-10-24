import express from 'express';
import { Client } from '@elastic/elasticsearch';
import cors from 'cors';
import axios from 'axios';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';


// Create an Express application
const app = express();
const port = 4001; // Define the port for the server

// Middleware to enable CORS (Cross-Origin Resource Sharing)
// This allows requests from different origins (like your frontend)
app.use(cors());

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
            index: 'phoenix-logs', // Adjust the index pattern if necessary
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

// Start the server and log the URL where it's running
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/api/logs`);
});


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
//     origin: '*'  // Allow requests from all origins, or specify frontend origin
// }));

// // Create an instance of the Elasticsearch client
// const client = new Client({
//     node: 'http://localhost:9200', // Use Docker service name for Elasticsearch
//     auth: { username: 'elastic', password: 'elk123' } // Adjust your Elasticsearch credentials
// });

// // API endpoint to fetch logs from the specific index
// app.get('/api/logs', async (req, res) => {


//     try {
//         // Log the incoming request for debugging
//         console.log("Received request to fetch logs");
//         // Search for logs in the specified index
//         const result = await client.search({
//             index: 'rrr-logs', // Adjust the index pattern if necessary
//             body: {
//                 query: {
//                     match_all: {} // Fetch all logs from the index
//                 },
//                 size: 50,
//                 // _source: ["message", "@timestamp", "event.original", "tags"]

//                 _source: ["message", "timestamp", "container.name", "kubernetes.pod.name", "kubernetes.namespace", "log.level"]
//             }
//         });


//         console.log("Elasticsearch response:", result); // Log the entire response
//         // Map the result to format the response
//         const logs = result.body.hits.hits.map(hit => ({
//             message: hit._source.message,
//             timestamp: hit._source['@timestamp'],
//             // tags: hit._source.tags || [],  // Add tags if available
//             container: hit._source.container?.name || "N/A",  // Add container name
//             pod: hit._source.kubernetes?.pod?.name || "N/A",  // Add pod name
//             namespace: hit._source.kubernetes?.namespace || "N/A",  // Add namespace info
//             level: hit._source.log?.level || "info" // Add log level if available
//         }));


//         res.json(logs);

//         // Log the results for debugging
//         // console.log("Logs fetched from Elasticsearch:", result.hits.hits);

//         // Send the fetched logs as a JSON response to the frontend
//         // res.json(result.hits.hits);




//     } catch (error) {
//         console.error('Error fetching logs from Elasticsearch:', error.meta.body.error || error.message);
//         console.log("Elasticsearch response body:", result.body);

//         res.status(500).send('Error fetching logs');
//     }

// });

// // Start the server and log the URL where it's running
// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}/api/logs`);
// });
