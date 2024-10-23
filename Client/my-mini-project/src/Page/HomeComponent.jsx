import React, { useEffect, useState } from "react";
import axios from "axios";

function HomeComponent(props) {
  const KUBERNETES_LOGS = [
    "[Critical] This is a critical log",
    "[Error] This is an error log",
    "[Warning] This is a warning log",
    "[Notice] This is a notice log",
  ];

  const [data, setData] = useState(KUBERNETES_LOGS);
  const [backendData, setBackendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch logs from the backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Update the URL to point to the backend server in Docker
        const response = await axios.get("http://localhost:3000/api/logs", {
          auth: {
            username: "elastic",
            password: "elk123",
          },
        });
        console.log("Fetched logs:", response.data); // Log fetched data
        setBackendData(response.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching backend logs:", err);
        setError("Failed to fetch logs from the backend");
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // // Fetch logs from the backend
  // useEffect(() => {
  //   const fetchLogs = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:3000/search", {
  //         auth: {
  //           username: "elastic",
  //           password: "elk123",
  //         },
  //       });
  //       console.log("Fetched logs:", response.data); // Log fetched data
  //       setBackendData(response.data);

  //       setLoading(false);
  //     } catch (err) {
  //       console.error("Error fetching backend logs:", err);
  //       setError("Failed to fetch logs from the backend");
  //       setLoading(false);
  //     }
  //   };

  //   fetchLogs();
  // }, []);

  function getLogColour(log) {
    if (log.includes("Error") || log.includes("error")) {
      return "log-error";
    } else if (log.includes("Warning") || log.includes("warning")) {
      return "log-warning";
    } else if (log.includes("Notice") || log.includes("notice")) {
      return "log-notice";
    } else if (log.includes("Critical") || log.includes("critical")) {
      return "log-critical";
    } else {
      return "log-normal";
    }
  }

  // Filter logs based on search input
  // const filteredLogs = [...data, ...backendData].filter((log) =>
  //   (log._source?.message || log).toLowerCase().includes(search.toLowerCase())
  // );

  // Filter logs based on search input
  const filteredLogs = [...data, ...backendData].filter((log) => {
    const logMessage = log._source?.message || log; // Access log message safely
    if (typeof logMessage !== "string") {
      console.warn("Log message is not a string:", logMessage); // Debugging
      return false; // Skip non-string log messages
    }
    return logMessage.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="home_component_main">
      {/* <div className="search_bar">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div> */}

      <div className="home_component_logs_div">
        <div className="logs_name">
          <p>Logs</p>
        </div>
        <div className="logs_div_main">
          {loading && <p>Loading backend logs...</p>}
          {error && <p>{error}</p>}

          {!loading &&
            !error &&
            backendData.map((current, index) => (
              <div
                key={index}
                className={getLogColour(current._source?.message || current)}
              >
                <p>{current._source?.message || current}</p>
              </div>
            ))}
        </div>
      </div>

      {/* This is chatbot */}
      <div className="home_component_chatbot_div">
        <div className="home_component_chatbot_image_and_text_div">
          <div>
            <img src="./chatbot.png" alt="Chatbot"></img>
          </div>
          <div>
            <p>How can I help you?</p>
          </div>
        </div>
        <div className="home_component_chat_box_div">
          <div className="home_component_query_div">
            <div>
              <input
                placeholder="Write your query here"
                className="chatbot_query_input"
              ></input>
            </div>
            <div>
              <img src="./query.svg" className="query_image" alt="Query"></img>
            </div>
          </div>
          <div className="home_component_query_output_div">
            <div className="waiting_animation">
              <div className="waiting_animation_1"></div>
              <div className="waiting_animation_2"></div>
              <div className="waiting_animation_3"></div>
              <div className="waiting_animation_4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeComponent;
