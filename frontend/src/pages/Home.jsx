import React from 'react'
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import { useState , useContext} from 'react';

function Home() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    // const heading = document.querySelector('.leftPanelInner');
    // const text = heading.textContent;
    // heading.innerHTML = text.split('').map(letter => `<span>${letter}</span>`).join('');
                

  return (
  <>

            <div className="navBar">

                <div style={{ display: "flex", alignItems: "center" }}>

                    <h2> Video Call</h2>
                </div>

                <div className='NavItems' style={{ display: "flex", alignItems: "center" }}>
                   <div className="Items"> 
                    <IconButton onClick={
                        () => {
                            navigate("/history")
                        }
                    }>
                        <RestoreIcon />
                    </IconButton>
                    </div>
                    <div className="Items">
                    <Button onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                        Logout
                    </Button>
                    </div>
                </div>


            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2 className="leftPanelInner">Providing Quality Video Call</h2>

                        <div style={{ display: 'flex', gap: "10px" }}>

                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                            <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

                        </div>
                    </div>
                </div>

                {/* undraw */}
                
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
        </>
    )
}

export default withAuth(Home);