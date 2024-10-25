import React from "react";
import axios from "axios";
import WebSocket from "ws";

function HomeComponent(props) {
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
    "2024-10-07T12:07:45Z node-2 kubelet[175]: Node node-2 memory usage exceeded threshold",
    "2024-10-07T12:08:02Z node-3 kubelet[180]: Starting pod 'redis-pod'",
    "2024-10-07T12:08:12Z node-2 kubelet[185]: Error: Readiness probe failed on container redis-container",
    "2024-10-07T12:08:17Z node-3 kubelet[190]: Successfully assigned default/redis-deployment-7d4bfc49df-gx9z5 to node-3",
    "2024-10-07T12:09:02Z node-1 kubelet[195]: Container 'busybox-container' restarted due to 'OOMKilled'",
    "2024-10-07T12:09:10Z node-2 kubelet[200]: Warning: Disk pressure on node-2, unable to allocate resources",
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

  // //=================Chat BOT=========================================

  // function appendMessage(text, className) {
  //   const messageContainer = document.getElementById("messages");
  //   const messageDiv = document.createElement("div");
  //   messageDiv.classList.add("message", className);

  //   // Format text for bold and italic
  //   text = text
  //     .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // Bold
  //     .replace(/\*(.+?)\*/g, "<em>$1</em>"); // Italic

  //   // Check if the response contains code snippets (```), split them accordingly
  //   const parts = text.split(/```/);
  //   parts.forEach((part, index) => {
  //     if (index % 2 === 0) {
  //       // Regular text
  //       const paragraph = document.createElement("p");
  //       paragraph.innerHTML = part.trim(); // Using innerHTML for bold/italic
  //       messageDiv.appendChild(paragraph);
  //     } else {
  //       // Code block
  //       const codeBlock = document.createElement("code");
  //       const languageLabel = document.createElement("span");
  //       const detectedLanguage = detectLanguage(part.trim());

  //       languageLabel.className = "language-label";
  //       languageLabel.innerText = `Language: ${detectedLanguage}`;
  //       codeBlock.textContent = part.trim();

  //       messageDiv.appendChild(languageLabel);
  //       messageDiv.appendChild(codeBlock);

  //       // Copy button for the code block
  //       const copyButton = document.createElement("button");
  //       copyButton.className = "copy-button";
  //       copyButton.innerText = "Copy Code";
  //       copyButton.onclick = () => {
  //         copyToClipboard(part.trim());
  //       };
  //       messageDiv.appendChild(copyButton); // Adding outside the code block
  //     }
  //   });

  //   // Add a button to copy all text in the bot message
  //   if (className === "bot") {
  //     const copyAllButton = document.createElement("button");
  //     copyAllButton.className = "copy-all-button";
  //     copyAllButton.innerText = "Copy All";
  //     copyAllButton.onclick = () => {
  //       copyToClipboard(text);
  //     };
  //     messageDiv.appendChild(copyAllButton);
  //   }

  //   messageContainer.appendChild(messageDiv);
  //   messageContainer.scrollTop = messageContainer.scrollHeight; // Scroll to the bottom
  // }

  // // Function to send message
  // async function sendMessage() {
  //   const userInput = document.getElementById("userInput");
  //   const message = userInput.value.trim();
  //   if (message === "") return;
  //   appendMessage(message, "user");
  //   console.log(message + " BEFORE__");
  //   const result = await axios.get(
  //     `http://localhost:3001/api/chatbot?query='${message}'`
  //   );
  //   console.log("Result_____: " + result);
  //   appendMessage(result.data.response, "bot");
  // }

  // // Allow sending message with Enter key
  // try {
  //   document
  //     .getElementById("userInput")
  //     .addEventListener("keypress", function (event) {
  //       if (event.key === "Enter") {
  //         sendMessage();
  //         event.preventDefault();
  //       }
  //     });
  // } catch (Error) {
  //   console.log("ERROR_____" + Error);
  // }

  // // Toggle chat visibility
  // function toggleChat() {
  //   const chatContainer = document.getElementById("chatContainer");
  //   chatContainer.style.display =
  //     chatContainer.style.display === "none" ||
  //     chatContainer.style.display === ""
  //       ? "flex"
  //       : "none";
  // }
  // // =============================ChatBot Ended==========================================

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

  // // Detect programming language from code
  // function detectLanguage(code) {
  //   if (code.includes("#include")) {
  //     return "C";
  //   } else if (
  //     code.includes("function") ||
  //     code.includes("var") ||
  //     code.includes("let")
  //   ) {
  //     return "JavaScript";
  //   } else if (code.includes("class")) {
  //     return "Java";
  //   }
  //   return "Plain Text";
  // }
  // =====================================================================================

  // Logs fetching
  React.useEffect(() => {
    axios
      .get("http://localhost:3001/api/logs") // Replace with your correct API endpoint
      .then((response) => {
        setData(response.data.logs); // Assuming the API returns a list of logs in 'response.data.logs'
        setFilteredData(response.data.logs); // Initialize filteredData with fetched logs
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

  //  =====================================================================================
  return (
    <div className="home_component_main">
      <div className="home_component_filter_div">
        <div className="home_component_filter_div_inner">
          <div>
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
      </div>

      <div className="home_component_logs_div">
        <div className="logs_name">
          <p>Logs</p>
        </div>
        <div className="logs_div_main">
          {filteredData.map((current, index) => {
            return (
              <div className={getLogColour(current)} id="copy_main_div">
                <div className="copy_log_div">
                  <img
                    src="./copy.svg"
                    onClick={() => {
                      navigator.clipboard.writeText(current);
                    }}
                  ></img>
                </div>
                <p>{current}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HomeComponent;
// <div style={{ position: "absolute" }}>
//   <button class="floating-button" onClick={() => toggleChat()}>
//     <img src="./chatbot.png"></img>
//   </button>
//   <div class="chat-container" id="chatContainer">
//     <div class="chat-header">Chatty</div>
//     <div class="messages" id="messages"></div>
//     <div class="input-container">
//       <input
//         type="text"
//         id="userInput"
//         placeholder="Type your message..."
//       />
//       <button id="image_send" onClick={() => sendMessage()}>
//         <img src="./query.svg"></img>
//       </button>
//     </div>
//   </div>
// </div>
