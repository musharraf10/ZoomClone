import React, { useRef } from 'react'

const ServerUrl = "http://localhost:8080";

const connections = {}; // convection
const PeerConfigConnections = {
    iceServers: [
        {
            urls: "stun:stun1.l.google.com:19302"
        }
    ]
}

export default function VideoMeet() {
    const socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video , setVideo] = useState();

    let [audio , setAudio] = useState();

    let [screenShare, setScreenShare] = useState();

    let [showModel, setShowModel] = useState();

    let [screenShareAvailable, setScreenShareAvailable] = useState();

    let [messages, setMessages] = useState();

    let [message, setMessage] = useState();

    let [newMessages, setNewMessages] = useState();

    let [askUsername, setAskUsername] = useState(true);

    let [userName, setUsername] = useState();

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);


    // if(isChrome() === false){

    // }


  return (
    <div>
        {askUsername === true ? 
        <div>
            
        </div> : <></>}



    </div>
  )
}

    // const connections = useRef({});
    // connections.current = {};    stun1.l.google.com:19302
    //slug /:url