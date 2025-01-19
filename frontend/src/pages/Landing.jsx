import React from "react";
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";

export default function Landing() {

    const router = useNavigate();

    let token = localStorage.getItem('token');

    const [toggle, setToggle] = useState(false);

    const toggleMenu = () => {
        setToggle(!toggle);
    };

    return (
        <div className="LandingPageContainer">
             <nav className="NavLanding">

                <div className='navHeader'>
                    <h2>Video Call</h2>
                </div>
                <div className={`navlist ${toggle ? 'active' : ''}`}>
                <p onClick={() => {
                  router("/GuestJoin", { state: { askForUsername: true } });
                  }}>Join as Guest</p>

                  <p onClick={()=>{
                    router("/home")
                  }}>
                    Home
                  </p>
                  {!token ?
                   <>
                    <p onClick={() => {
                        router("/auth")

                    }}>Register</p> 
                    
                    <p onClick={() => {
                        router("/auth")

                    }}>Login</p></>:<></>}
                    
                </div>
                <button className="toggle-btn" onClick={toggleMenu}>
                    &#9776;
             </button>
            </nav>


            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones💕</h1>

                    <p>Cover a distance by Shaik's Video Call</p>
                    <div role='button'>
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>

                    <img src="/image1.png" alt="Image Loading" />

                </div>
            </div>
        </div>
    )
}