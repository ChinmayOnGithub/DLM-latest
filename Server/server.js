const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');

// Create an Express application
const app = express();
const port = 3000; // Define the port for the server

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
// const cors = require('cors');

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

