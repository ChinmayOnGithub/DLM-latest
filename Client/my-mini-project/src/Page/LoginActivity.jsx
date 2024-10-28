import React from "react";
import axios from "axios";

const URL = "http:/localhost:3001";

function LoginActivity(props) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [message, setMessage] = React.useState("");

  const [usernameLogin, setUsernameLogin] = React.useState("");
  const [usernameRegister, setUsernameRegister] = React.useState("");
  const [passwordLogin, setPasswordLogin] = React.useState("");
  const [passwordRegisterFirst, setPasswordRegisterFirst] = React.useState("");
  const [passwordRegisterSecond, setPasswordRegisterSecond] =
    React.useState("");

  function trackInputChanges(event) {
    if (event.target.name === "username_login") {
      setUsernameLogin(event.target.value);
    } else if (event.target.name === "password_login") {
      setPasswordLogin(event.target.value);
    } else if (event.target.name === "username_register") {
      setUsernameRegister(event.target.value);
    } else if (event.target.name === "password_register_first") {
      setPasswordRegisterFirst(event.target.value);
    } else if (event.target.name === "password_register_second") {
      setPasswordRegisterSecond(event.target.value);
    }
  }

  React.useEffect(() => {
    setPasswordLogin("");
    setPasswordRegisterFirst("");
    setPasswordRegisterSecond("");
    setUsernameLogin("");
    setUsernameRegister("");
    setMessage("");
  }, [isLogin]);

  async function registerNewUser() {
    if (passwordRegisterFirst === passwordRegisterSecond) {
      const result = await axios.put(
        `http://localhost:3001/addUser?username=${usernameRegister}&password=${passwordRegisterFirst}`
      );
      if (result.data.success === "yes") {
        setMessage("User Registered Successfully");
      } else {
        setMessage("User Already Found");
      }
    } else {
      setMessage("Password not matching");
    }
  }

  async function loginUser() {
    const result = await axios.get(
      `http://localhost:3001/verifyUser?username=${usernameLogin}&password=${passwordLogin}`
    );
    console.log(result.data);
    if (result.data.authenticate === true) {
      props.setAuthToTrue();
    } else {
      setMessage("Authentication failed");
    }
  }

  return (
    <div className="login_activity_main">
      <div className="div_for_style_1">
        <div>
          <img src="./docker.svg"></img>
        </div>
      </div>
      <div className="div_for_style_2">
        <div>
          <img src="./load.svg"></img>
        </div>
      </div>
      <div className="div_for_style_3">
        <div>
          <img src="./kubernetes.svg"></img>
        </div>
      </div>
      <div className="div_for_style_4">
        <div>
          <img src="./logs.webp"></img>
        </div>
      </div>
      <div className="login_activity_card">
        {isLogin ? (
          <div className={`login_card ${isLogin ? "add_card_login" : ""}`}>
            <div>
              <div>
                <i class="ri-user-line image_icon"></i>
              </div>
              <div>
                <input
                  required
                  placeholder="Username"
                  name="username_login"
                  onChange={trackInputChanges}
                  value={usernameLogin}
                ></input>
              </div>
            </div>
            <div>
              <div>
                <i class="ri-key-fill image_icon"></i>
              </div>
              <div>
                <input
                  required
                  name="password_login"
                  type="password"
                  placeholder="Password"
                  onChange={trackInputChanges}
                  value={passwordLogin}
                ></input>
              </div>
            </div>
            <div className="dont_have_account_div">
              <p>
                Don't have an account?{" "}
                <span
                  className="activity_login_changer"
                  onClick={() => {
                    setIsLogin(false);
                  }}
                >
                  Register
                </span>
              </p>
            </div>
            <div className="login_button_div">
              <div>
                <div>
                  <img src="./google.svg" className="image_login"></img>
                </div>
                <div>
                  <p>Continue with google</p>
                </div>
              </div>
              <div onClick={loginUser}>
                <div>
                  <img src="./login.svg" className="image_login"></img>
                </div>
                <div>
                  <p>Login</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`register_card ${isLogin ? "" : "add_card_register"}`}
          >
            <div>
              <div>
                <i class="ri-user-line image_icon"></i>
              </div>
              <div>
                <input
                  required
                  name="username_register"
                  placeholder="Username"
                  onChange={trackInputChanges}
                  value={usernameRegister}
                ></input>
              </div>
            </div>
            <div>
              <div>
                <i class="ri-key-fill image_icon"></i>
              </div>
              <div>
                <input
                  required
                  name="password_register_first"
                  type="password"
                  placeholder="Password"
                  onChange={trackInputChanges}
                  value={passwordRegisterFirst}
                ></input>
              </div>
            </div>
            <div>
              <div>
                <i class="ri-key-fill image_icon"></i>
              </div>
              <div>
                <input
                  required
                  name="password_register_second"
                  type="password"
                  placeholder="Password"
                  onChange={trackInputChanges}
                  value={passwordRegisterSecond}
                ></input>
              </div>
            </div>
            <div className="dont_have_account_div">
              <p>
                Already have an account?{" "}
                <span
                  className="activity_login_changer"
                  onClick={() => {
                    setIsLogin(true);
                  }}
                >
                  Login
                </span>
              </p>
            </div>
            <div className="login_button_div" onClick={registerNewUser}>
              <div>
                <div>
                  <img src="./login.svg" className="image_login"></img>
                </div>
                <div>
                  <p>Register</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="message_div">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default LoginActivity;
