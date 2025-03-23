import React, { useState } from "react";
import "./RegisterLogin.css";

import mail_icon from "/Users/hafsa/Desktop/project/GreenCycle.lk/frontend/src/images/user-dashboard/mail-icon.png";
import password_icon from "/Users/hafsa/Desktop/project/GreenCycle.lk/frontend/src/images/user-dashboard/password-icon.png";
import user_icon from "/Users/hafsa/Desktop/project/GreenCycle.lk/frontend/src/images/user-dashboard/user-icon.png";

const RegisterLogin = () => {
  const [action, setAction] = useState("Create your account");
  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        {action === "Login" ? (
          <div></div>
        ) : (
          <div className="input">
            <img src={user_icon} alt="" />
            <input type="text" placeholder="Name" />
          </div>
        )}

        <div className="input">
          <img src={mail_icon} alt="" />
          <input type="email" placeholder="Email" />
        </div>

        <div className="input">
          <img src={password_icon} alt="" />
          <input type="password" placeholder="Password" />
        </div>
      </div>
      {action==="Create your account"?<div></div>:<div className="forgot-password">
        Forgot password?<span> Click Here</span>
      </div>}
      
      <div className="submit-container">
        <div
          className={action === "Login" ? "submit gray" : "submit"}
          onClick={() => {
            setAction("Create your account");
          }}
        >
          Register
        </div>
        <div
          className={
            action === "Create your account" ? "submit gray" : "submit"
          }
          onClick={() => {
            setAction("Login");
          }}
        >
          Login
        </div>
      </div>
    </div>
  );
};

export default RegisterLogin;
