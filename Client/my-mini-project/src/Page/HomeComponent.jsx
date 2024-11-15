import React from "react";
import axios from "axios";

function HomeComponent(props) {
  const [darkTheme, setDarkTheme] = React.useState(true);

  function toggleDarkTheme() {
    setDarkTheme((prevTheme) => {
      const newTheme = !prevTheme; // Get the new theme value immediately
      const r = document.querySelector(":root");
      r.style.setProperty(
        "--appTheme",
        newTheme ? "rgb(28, 28, 28)" : "aliceblue"
      );
      r.style.setProperty(
        "--fontTheme",
        newTheme ? "aliceblue" : "rgb(28, 28, 28)"
      );
      r.style.setProperty("--error-color", newTheme ? "red" : "red");
      r.style.setProperty(
        "--warning-color",
        newTheme ? "yellow" : "rgb(232, 169, 11)"
      );
      r.style.setProperty(
        "--default-color",
        newTheme ? "lime" : "rgb(2, 203, 2)"
      );
      r.style.setProperty(
        "--warning-color-hover",
        newTheme ? "rgb(232, 169, 11)" : "rgb(232, 169, 11)"
      );
      r.style.setProperty("--error-color-hover", newTheme ? "red" : "crimson");

      return newTheme;
    });
  }

  const KUBERNETES_LOGS = [
    "2024-10-07T12:01:23Z node-1 kubelet[112]: Successfully pulled image 'nginx:latest'",
    "2024-10-07T12:01:25Z node-2 kubelet[115]: Created container nginx-container",
    "2024-10-07T12:01:27Z node-3 kubelet[117]: Started container nginx-container",
    "2024-10-07T12:02:02Z node-1 kubelet[120]: Successfully assigned default/nginx-deployment-7d4bfc49df-fbl62 to node-1",
    "2024-10-07T12:02:10Z node-3 kubelet[122]: Pulling image 'busybox:latest'",
    "2024-10-07T12:02:12Z node-2 kubelet[125]: Created container busybox-container",
    "2024-10-07T12:02:20Z node-2 kubelet[127]: Started container busybox-container",
    "2024-10-07T12:02:25Z node-2 kubelet[130]: Pod default/nginx-deployment-7d4bfc49df-fbl62 completed",
    "2024-10-07T12:03:12Z node-1 kubelet[135]: Error: failed to start container 'nginx-container': ImagePullBackOff",
    "2024-10-07T12:03:15Z node-3 kubelet[140]: Pod default/busybox failed to start due to 'CrashLoopBackOff'",
    "2024-10-07T12:03:45Z node-1 kubelet[145]: Warning: Node node-1 is under pressure, unable to schedule new pods",
    "2024-10-07T12:04:00Z node-2 kubelet[150]: Error: liveness probe failed on container nginx-container",
    "2024-10-07T12:04:15Z node-3 kubelet[160]: Pod nginx-deployment-7d4bfc49df-fbl62 Terminated with status code: 1",
    "2024-10-07T12:05:30Z node-1 kubelet[165]: Pod default/busybox terminated unexpectedly, restarting...",
    "2024-10-07T12:06:12Z node-1 kubelet[170]: Error: failed to create container busybox-container: Image not found",
  ];
  const [filteredData, setFilteredData] = React.useState([]);
  const [data, setData] = React.useState(filteredData);
  const [filterCheck, setFilterCheck] = React.useState({
    error: false,
    warning: false,
    critical: false,
    notice: false,
    info: false,
  });
  const [showMessage, setShowMessage] = React.useState(false);

  function onFilterDataClicked() {
    const filters = [];

    // Collect all selected filters
    if (filterCheck.error) filters.push("Error", "error");
    if (filterCheck.warning) filters.push("Warning", "warning");
    if (filterCheck.critical) filters.push("Critical", "critical");
    if (filterCheck.notice) filters.push("Notice", "notice");
    if (filterCheck.info) filters.push("Info", "info");

    if (filters.length === 0) {
      // If no filter is selected, show all logs
      setFilteredData(filteredData);
    } else {
      // Filter the logs based on selected filters
      const filtered = filteredData.filter((log) => {
        return filters.some((filter) => log.includes(filter));
      });
      setFilteredData(filtered);
    }
  }

  function getLogColour(log) {
    if (log.includes("Warning") || log.includes("warning")) {
      return "log-warning";
    } else if (log.includes("Error") || log.includes("error")) {
      return "log-error";
    } else {
      return "log-normal";
    }
  }

  //=================Chat BOT=========================================

  function appendMessage(text, className) {
    const messageContainer = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", className);

    // Format text for bold and italic
    text = text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*(.+?)\*/g, "<em>$1</em>"); // Italic

    // Check if the response contains code snippets (```), split them accordingly
    const parts = text.split(/```/);
    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        // Regular text
        const paragraph = document.createElement("p");
        paragraph.innerHTML = part.trim(); // Using innerHTML for bold/italic
        messageDiv.appendChild(paragraph);
      } else {
        // Code block
        const codeBlock = document.createElement("code");
        const languageLabel = document.createElement("span");
        const detectedLanguage = detectLanguage(part.trim());

        languageLabel.className = "language-label";
        languageLabel.innerText = `Language: ${detectedLanguage}`;
        codeBlock.textContent = part.trim();

        messageDiv.appendChild(languageLabel);
        messageDiv.appendChild(codeBlock);

        // Copy button for the code block
        const copyButton = document.createElement("button");
        copyButton.className = "copy-button";
        copyButton.innerText = "Copy Code";
        copyButton.onclick = () => {
          copyToClipboard(part.trim());
        };
        messageDiv.appendChild(copyButton); // Adding outside the code block
      }
    });

    // Add a button to copy all text in the bot message
    if (className === "bot") {
      const copyAllButton = document.createElement("button");
      copyAllButton.className = "copy-all-button";
      copyAllButton.innerText = "Copy All";
      copyAllButton.onclick = () => {
        copyToClipboard(text);
      };
      messageDiv.appendChild(copyAllButton);
    }

    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight; // Scroll to the bottom
  }

  // Function to send message
  async function sendMessage() {
    const userInput = document.getElementById("userInput");
    const message = userInput.value.trim();
    if (message === "") return;
    appendMessage(message, "user");
    console.log(message + " BEFORE__");
    const result = await axios.get(
      `http://localhost:3001/api/chatbot?query='${message}'`
    );
    console.log("Result_____: " + result);
    appendMessage(result.data.response, "bot");
  }

  // Allow sending message with Enter key
  try {
    document
      .getElementById("userInput")
      .addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          sendMessage();
          event.preventDefault();
        }
      });
  } catch (Error) {
    console.log("ERROR_____" + Error);
  }

  // Toggle chat visibility
  function toggleChat() {
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.style.display =
      chatContainer.style.display === "none" ||
      chatContainer.style.display === ""
        ? "flex"
        : "none";
  }
  // =============================ChatBot Ended==========================================

  // Copy code to clipboard
  function copyToClipboard(code) {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        alert("Text copied to clipboard!");
        console.log("Copied text:", code);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  }

  // Detect programming language from code
  function detectLanguage(code) {
    if (code.includes("#include")) {
      return "C";
    } else if (
      code.includes("function") ||
      code.includes("var") ||
      code.includes("let")
    ) {
      return "JavaScript";
    } else if (code.includes("class")) {
      return "Java";
    }
    return "Plain Text";
  }
  // =====================================================================================

  function copyLogAndShowMessage(log) {
    navigator.clipboard.writeText(log);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 1000);
  }

  // Logs fetching
  React.useEffect(() => {
    axios
      .get("http://localhost:3001/readLogsFile") // Replace with your correct API endpoint
      .then((response) => {
        setData(response.data); // Assuming the API returns a list of logs in 'response.data.logs'
        setFilteredData(response.data); // Initialize filteredData with fetched logs
        console.log(response.data);
        const data = [];
        response.data.forEach((element) => {
          console.log(element);
          data.push(element._source.message);
        });
        setFilteredData(data);
      })
      .catch((error) => {
        console.error("Error fetching logs: ", error);
      });
  }, [filterCheck]);
  React.useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFilteredData(data); // Update state with the incoming data
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close(); // Cleanup on unmount
    };
  }, []);

  //  =====================================================================================
  return (
    <div className="home_component_main">
      {showMessage && (
        <div id="log_copied_message_div">
          <p>Log copied</p>
        </div>
      )}
      <div className="logs_name">
        <div>
          <p>Logs</p>
        </div>
        <div className="right_side">
          <div>
            <button className="theme_img" onClick={toggleDarkTheme}>
              <img src="./theme.png"></img>
            </button>
          </div>
          <div>
            <button className="logout_img" onClick={props.setAuthToFalse}>
              <img src="./logout.png"></img>
            </button>
          </div>
        </div>
      </div>
      <div
        className="home_component_filter_div"
        style={{
          backgroundColor: darkTheme ? "rgb(21,21,21)" : "#e3e3e3",
          color: darkTheme ? "aliceblue" : "rgb(28, 28, 28)",
        }}
      >
        <div
          className="checkbox_label_div"
          onClick={() => {
            setFilterCheck((prev) => ({
              ...prev,
              error: !prev.error,
            }));
          }}
        >
          <div>
            <input
              type="checkbox"
              checked={filterCheck.error}
              onChange={(e) => {
                setFilterCheck((prev) => ({
                  ...prev,
                  error: e.target.checked,
                }));
              }}
            ></input>
          </div>
          <div>
            <label>Error</label>
          </div>
        </div>
        <div
          className="checkbox_label_div"
          onClick={() => {
            setFilterCheck((prev) => ({
              ...prev,
              warning: !prev.warning,
            }));
          }}
        >
          <div>
            <input
              type="checkbox"
              checked={filterCheck.warning}
              onChange={(e) => {
                setFilterCheck((prev) => ({
                  ...prev,
                  warning: e.target.checked,
                }));
              }}
            ></input>
          </div>
          <div>
            <label>Warning</label>
          </div>
        </div>
        <div
          className="checkbox_label_div"
          onClick={() => {
            setFilterCheck((prev) => ({
              ...prev,
              critical: !prev.critical,
            }));
          }}
        >
          <div>
            <input
              type="checkbox"
              checked={filterCheck.critical}
              onChange={(e) => {
                setFilterCheck((prev) => ({
                  ...prev,
                  critical: e.target.checked,
                }));
              }}
            ></input>
          </div>
          <div>
            <label>Critical</label>
          </div>
        </div>
        <div
          className="checkbox_label_div"
          onClick={() => {
            setFilterCheck((prev) => ({
              ...prev,
              notice: !prev.notice,
            }));
          }}
        >
          <div>
            <input
              type="checkbox"
              checked={filterCheck.notice}
              onChange={(e) => {
                setFilterCheck((prev) => ({
                  ...prev,
                  notice: e.target.checked,
                }));
              }}
            ></input>
          </div>
          <div>
            <label>Notice</label>
          </div>
        </div>
        <div
          className="checkbox_label_div"
          onClick={() => {
            setFilterCheck((prev) => ({
              ...prev,
              info: !prev.info,
            }));
          }}
        >
          <div>
            <input
              type="checkbox"
              checked={filterCheck.info}
              onChange={(e) => {
                setFilterCheck((prev) => ({
                  ...prev,
                  info: e.target.checked,
                }));
              }}
            ></input>
          </div>
          <div>
            <label>Info</label>
          </div>
        </div>
        <div className="div_filter_btn">
          <button
            onClick={() => {
              onFilterDataClicked();
            }}
          >
            Filter
          </button>
        </div>
      </div>

      <div
        className="home_component_logs_div"
        style={{
          backgroundColor: darkTheme ? "rgb(21,21,21)" : "#e3e3e3",
          color: darkTheme ? "aliceblue" : "rgb(28, 28, 28)",
        }}
      >
        <div className="logs_div_main">
          {filteredData.map((current, index) => {
            return (
              <div
                className={getLogColour(current)}
                id="copy_main_div"
                onClick={() => copyLogAndShowMessage(current)}
              >
                <div className="copy_log_div">
                  {/* <img
                    style={{cursor:"pointer"}}
                    src="./copy.svg"
                    onClick={() => {
                      navigator.clipboard.writeText(current);
                    }}
                  ></img> */}
                </div>
                <p>{current}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "absolute" }}>
        <button class="floating-button" onClick={() => toggleChat()}>
          <img src="./chatbot.png"></img>
        </button>
        <div class="chat-container" id="chatContainer">
          <div class="chat-header">Chatbot</div>
          <div class="messages" id="messages"></div>
          <div class="input-container">
            <input
              type="text"
              id="userInput"
              placeholder="Type your message..."
            />
            <button id="image_send" onClick={() => sendMessage()}>
              <img src="./query.svg"></img>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeComponent;

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function HomeComponent(props) {
//   const KUBERNETES_LOGS = [
//     "[Critical] This is a critical log",
//     "[Error] This is an error log",
//     "[Warning] This is a warning log",
//     "[Notice] This is a notice log",
//   ];

//   const [data, setData] = useState(KUBERNETES_LOGS);
//   const [backendData, setBackendData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [search, setSearch] = useState("");

//   // Fetch logs from the backend
//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         // Update the URL to point to the backend server in Docker
//         const response = await axios.get("http://localhost:3000/api/logs", {
//           auth: {
//             username: "elastic",
//             password: "elk123",
//           },
//         });
//         console.log("Fetched logs:", response.data); // Log fetched data
//         setBackendData(response.data);

//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching backend logs:", err);
//         setError("Failed to fetch logs from the backend");
//         setLoading(false);
//       }
//     };

//     fetchLogs();
//   }, []);

//   // // Fetch logs from the backend
//   // useEffect(() => {
//   //   const fetchLogs = async () => {
//   //     try {
//   //       const response = await axios.get("http://localhost:3000/search", {
//   //         auth: {
//   //           username: "elastic",
//   //           password: "elk123",
//   //         },
//   //       });
//   //       console.log("Fetched logs:", response.data); // Log fetched data
//   //       setBackendData(response.data);

//   //       setLoading(false);
//   //     } catch (err) {
//   //       console.error("Error fetching backend logs:", err);
//   //       setError("Failed to fetch logs from the backend");
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchLogs();
//   // }, []);

//   function getLogColour(log) {
//     if (log.includes("Error") || log.includes("error")) {
//       return "log-error";
//     } else if (log.includes("Warning") || log.includes("warning")) {
//       return "log-warning";
//     } else if (log.includes("Notice") || log.includes("notice")) {
//       return "log-notice";
//     } else if (log.includes("Critical") || log.includes("critical")) {
//       return "log-critical";
//     } else {
//       return "log-normal";
//     }

//     // const getLogColour = (log) => {
//     //   if (!log) {
//     //     return "gray"; // Default color if log is undefined
//     //   }
//     //   // Color coding based on log level
//     //   if (log.level === "error") {
//     //     return "log-error"; // You can define this class in your CSS
//     //   } else if (log.level === "warning") {
//     //     return "log-warning"; // Define this class too
//     //   } else if (log.level === "critical") {
//     //     return "log-critical"; // Define this class too
//     //   } else {
//     //     return "log-normal"; // Default color
//     //   }
//   }

//   // Filter logs based on search input
//   // const filteredLogs = [...data, ...backendData].filter((log) =>
//   //   (log._source?.message || log).toLowerCase().includes(search.toLowerCase())
//   // );

//   // Filter logs based on search input
//   const filteredLogs = [...data, ...backendData].filter((log) => {
//     const logMessage = log._source?.message || log; // Access log message safely
//     if (typeof logMessage !== "string") {
//       console.warn("Log message is not a string:", logMessage); // Debugging
//       return false; // Skip non-string log messages
//     }
//     return logMessage.toLowerCase().includes(search.toLowerCase());
//   });

//   return (
//     <div className="home_component_main">
//       {/* <div className="search_bar">
//         <input
//           type="text"
//           placeholder="Search logs..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div> */}

//       <div className="home_component_logs_div">
//         <div className="logs_name">
//           <p>Logs</p>
//         </div>
//         <div className="logs_div_main">
//           {loading && <p>Loading backend logs...</p>}
//           {error && <p>{error}</p>}

//           {!loading &&
//             !error &&
//             backendData.map((log, index) => (
//               <div key={index} className={getLogColour(log.message)}>
//                 <p>
//                   <strong>Message:</strong> {log.message}
//                 </p>
//                 <p>
//                   <strong>Timestamp:</strong> {log.timestamp}
//                 </p>
//                 <p>
//                   <strong>Container:</strong> {log.container}
//                 </p>
//                 <p>
//                   <strong>Pod:</strong> {log.pod}
//                 </p>
//                 <p>
//                   <strong>Namespace:</strong> {log.namespace}
//                 </p>
//                 <p>
//                   <strong>Level:</strong> {log.level}
//                 </p>
//               </div>
//             ))}
//         </div>
//       </div>

//       {/* This is chatbot */}
//       <div className="home_component_chatbot_div">
//         <div className="home_component_chatbot_image_and_text_div">
//           <div>
//             <img src="./chatbot.png" alt="Chatbot"></img>
//           </div>
//           <div>
//             <p>How can I help you?</p>
//           </div>
//         </div>
//         <div className="home_component_chat_box_div">
//           <div className="home_component_query_div">
//             <div>
//               <input
//                 placeholder="Write your query here"
//                 className="chatbot_query_input"
//               ></input>
//             </div>
//             <div>
//               <img src="./query.svg" className="query_image" alt="Query"></img>
//             </div>
//           </div>
//           <div className="home_component_query_output_div">
//             <div className="waiting_animation">
//               <div className="waiting_animation_1"></div>
//               <div className="waiting_animation_2"></div>
//               <div className="waiting_animation_3"></div>
//               <div className="waiting_animation_4"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default HomeComponent;
