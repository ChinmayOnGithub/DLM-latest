import "./App.css";
import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import LoginActivity from "./Page/LoginActivity";
import HomeComponent from "./Page/HomeComponent";

function App() {
  const [auth, setAuth] = React.useState(false);
  const navigate = useNavigate(); // Use the navigate hook inside the Router

  function setAuthToTrue() {
    setAuth(true);
  }

  function setAuthToFalse() {
    setAuth(false);
  }

  React.useEffect(() => {
    if (auth) {
      navigate("/Home");
    } else {
      navigate("/Login");
    }
  }, [auth, navigate]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to={auth ? "/Home" : "/Login"} />} />
        <Route
          path="/Login"
          element={<LoginActivity setAuthToTrue={setAuthToTrue} />}
        />
        <Route
          path="/Home"
          element={<HomeComponent setAuthToFalse={setAuthToFalse} />}
        />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
