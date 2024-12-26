import React from "react";
import "../App.css";
import { Link, useNavigate } from 'react-router-dom'

export default function Landing() {

    const router = useNavigate();
    return (
        <div className="LandingPageContainer">
             <nav>
                <div className='navHeader'>
                    <h2>Video Call</h2>
                </div>
                <div className='navlist'>
                    <p onClick={() => {
                        router("/aljk23")
                    }}>Join as Guest</p>
                    <p onClick={() => {
                        router("/auth")

                    }}>Register</p>
                    <div onClick={() => {
                        router("/auth")

                    }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>


            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones</h1>

                    <p>Cover a distance by 2085 Video Call</p>
                    <div role='button'>
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>

                    <img src="/image1.png" alt="" />

                </div>
            </div>
        </div>
    )
}