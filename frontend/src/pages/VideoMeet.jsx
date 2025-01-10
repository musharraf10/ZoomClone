import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/VideoMeet.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import server from '../environment';
import fetchUsername from "../utils/userService.js";

const server_url = server;

let connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    const router = useNavigate();

    var socketRef = useRef();

    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    const location = useLocation();

    let [username, setUsername] = useState(location.state?.username || "");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([]);

    const name = fetchUsername();

    const [isFrontCamera, setIsFrontCamera] = useState(true); 

    const [visibilityTimer, setVisibilityTimer] = useState(null);

     useEffect(() => {
            if (location.state?.askForUsername) {
                setAskForUsername(true);
            }
    }, [location]);

    // TODO
    // if(isChrome() === false) {

    const INACTIVITY_LIMIT = 3 * 60 * 1000;
    // }

   // Only run once when the component is mounted
    useEffect(() => {
        console.log("HELLO");
        getPermissions();
    }, []); // Add empty dependency array to run only once


    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
                  // Handle the 'beforeunload' event
                  const handleBeforeUnload = (e) => {
                    // Optionally show a confirmation message (in modern browsers, this may not work as intended)
                    e.preventDefault();
                    e.returnValue = '';
                  };
              
                  // Handle the 'visibilitychange' event
              
                  window.addEventListener("beforeunload", handleBeforeUnload);
                  document.addEventListener("visibilitychange", handleBeforeUnload);
              
                  return () => {
                    // Cleanup event listeners and stop the video track on unmount
                    window.removeEventListener("beforeunload", handleBeforeUnload);
                    document.removeEventListener("visibilitychange", handleBeforeUnload);
                  };
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            // console.log("SET STATE HAS ", video, audio);
        }

    }, [video, audio])


    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }


    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        // console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        const signal = JSON.parse(message);
    
        // Ensure the connection exists
        if (!connections[fromId]) {
            // Create a new RTCPeerConnection for the fromId if it doesn't exist
            connections[fromId] = new RTCPeerConnection(peerConfigConnections);
        }
    
        const peerConnection = connections[fromId]; // Get the peer connection
    
        if (signal.sdp) {
            // Check if the peer connection exists before setting the remote description
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    if (signal.sdp.type === 'offer') {
                        // If the signal is an offer, create an answer
                        peerConnection.createAnswer()
                            .then((description) => {
                                peerConnection.setLocalDescription(description).then(() => {
                                    socketRef.current.emit('signal', fromId, JSON.stringify({
                                        'sdp': peerConnection.localDescription
                                    }));
                                }).catch(e => console.log("Error setting local description:", e));
                            })
                            .catch(e => console.log("Error creating answer:", e));
                    }
                })
                .catch(e => console.log("Error setting remote description:", e));
        }
    
        if (signal.ice) {
            // Add ICE candidate if received
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(e => console.log("Error adding ICE candidate:", e));
        }
    };
    




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));  // Remove the video from the state
            });
            

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        // console.log("BEFORE:", videoRef.current);
                        // console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }


    const switchCamera = async () => {
        // Stop current video tracks to free up the resources
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());

        // Switch between front and back camera by toggling 'facingMode'
        const videoConstraints = {
            video: {
                facingMode: isFrontCamera ? 'environment' : 'user' // 'user' for front, 'environment' for back
            }
        };
        console.log(videoConstraints.video.facingMode);

        try {
            // Get the media stream for the new camera
            const newStream = await navigator.mediaDevices.getUserMedia(videoConstraints);

            // Set the new stream as the video source
            localVideoref.current.srcObject = newStream;

            // Update the local stream if you're using it elsewhere in the app
            window.localStream = newStream;

            // Toggle the camera state
            setIsFrontCamera(prevState => !prevState);
        } catch (error) {
            console.error("Error switching camera:", error);
        }
    };

    

    let handleVideo = () => {
        setVideo(!video);
    };
    
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    useEffect(() => {
        const handleBackButton = () => {
            let tracks = localVideoref.current.srcObject?.getTracks();
            if (tracks) {
                tracks.forEach(track => track.stop());
            }
        };

        window.removeEventListener("beforeunload", handleBackButton);
        document.removeEventListener("visibilitychange", handleBackButton);
    
        window.addEventListener("popstate", handleBackButton);
    
        return () => {
            window.removeEventListener("popstate", handleBackButton);
        };
    }, []);

    useEffect(() => {

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // User has left the page, start a 5-minute timer
                const timer = setTimeout(() => {
                    // Automatically end the call after 5 minutes of inactivity
                    console.log("User inactive for 3 minutes. Ending call.");
                    handleEndCall();
                }, INACTIVITY_LIMIT);
                setVisibilityTimer(timer);
            } else {
                // User has come back to the page, clear the timer
                if (visibilityTimer) {
                    clearTimeout(visibilityTimer);
                    setVisibilityTimer(null);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup event listener on component unmount
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [visibilityTimer]);
    
    let handleEndCall = () => {
        try {
            // Stop all media tracks to release resources
            let tracks = localVideoref.current?.srcObject?.getTracks();
            if (tracks) {
                tracks.forEach(track => track.stop());
            }
        } catch (e) {
            console.log("Error stopping tracks:", e);
        }
    
        // Clean up peer connections
        for (let id in connections) {
            if (connections[id]) {
                connections[id].close();
            }
        }
        connections = {};  // Clear the connections object
    
        // Disconnect from the socket server
        if (socketRef.current) {
            socketRef.current.off('chat-message', addMessage);
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            // socketRef.current = null;
        }
    
        // Navigate to the home page after ending the call
        router("/home");
    };
    
    
    
    let toggleChat = () => {
        if (showModal) {
            // If the chat is open, close it
            setModal(false);
        } else {
            // If the chat is closed, open it and reset newMessages
            setModal(true);
            setNewMessages(0);  // Reset new message count when chat is viewed
        }
    };
    
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    useEffect(() => {
        // Connect to the socket server and listen for chat messages
        socketRef.current = io.connect(server_url, { secure: false });

        // Only add the 'chat-message' listener once
        socketRef.current.on('chat-message', addMessage);

        // Cleanup event listeners and disconnect socket on component unmount
        return () => {
            socketRef.current.off('chat-message', addMessage); // Remove the listener
            socketRef.current.disconnect(); // Disconnect the socket
        };
    }, []);

    const addMessage = (data, sender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender, data }
        ]);
        if (!showModal) {
            setNewMessages((prevCount) => prevCount + 1);
        }
    };

    const sendMessage = () => {
        if (message.trim()) {
            // Emit the message to the server
            socketRef.current.emit('chat-message', message, username); // Assuming the username is Musharaf
            setMessage(""); // Clear the message input
        }
    };

    
    const [submitted, setSubmitted] = useState(true);
        let connect = () => {
            if(!username) return;
            setAskForUsername(false);
            setSubmitted(true);
            getMedia();
        }


        return (
            <div>
                {askForUsername ? (
                    <div className={styles.UserLobbyContainer}>
                        <HomeIcon className="homeIcon" onClick={() => router("/")} />
        
                        <h2>Enter into Lobby</h2>
        
                        <TextField
                            id="outlined-basic"
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="outlined"
                            className={styles.UserInputField}
                            required
                            error={!username && submitted}
                            helperText={!username && submitted ? "Username is required" : ""}
                            disabled={username === name} // Disable if username is not an empty string
                        
                        />
        
                        <Button
                            variant="contained"
                            onClick={connect}
                            className={styles.UserConnectButton}
                        >
                            Connect
                        </Button>
        
                        <div className={styles.UserVideoContainer}>
                            <video ref={localVideoref} autoPlay muted className={styles.UserVideoElement}></video>
                        </div>
                    </div>
                ) : (
                    <div className={styles.meetVideoContainer}>
                    {/* Chat Modal */}
                    {showModal && (
                    <div className={styles.chatRoom}>
                        <div className={styles.chatContainer}>
                        <h1>Chat</h1>

                        <div className={styles.chattingDisplay}>
                            {messages.length > 0 ? (
                            messages.map((item, index) => (
                                <div
                                key={index}
                                className={`${styles.chatMessage} ${
                                    item.sender === username ? styles.receiver : styles.sender
                                }`}
                                >
                                <p className={styles.userName}>{item.sender}</p>
                                <p className={`${styles.messageContent} ${item.sender === username ? styles.receiver : styles.sender}`}>{item.data}</p>
                                </div>
                            ))
                            ) : (
                            <p>No Messages Yet</p>
                            )}
                        </div>

                        <div className={styles.chattingArea}>
                            <TextField
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            id="outlined-basic"
                            label="Enter Your Chat"
                            variant="outlined"
                            fullWidth
                            />
                            <Button
                            variant="contained"
                            onClick={sendMessage}
                            style={{ marginLeft: "10px" }}
                            >
                            Send
                            </Button>
                        </div>
                        </div>
                    </div>
                    )}

                
                    {/* Video Grid */}
                    <div className={styles.videoGrid}>
                        <div className={styles.videoContainer}>
                            <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
                            <span className={styles.youLabel}>You</span>
                            <div className={styles.controlsContainer}>
                                <IconButton onClick={handleVideo} style={{ color: "black" }}>
                                    {video ? <VideocamIcon /> : <VideocamOffIcon />}
                                </IconButton>
                                <IconButton onClick={handleAudio} style={{ color: "black" }}>
                                    {audio ? <MicIcon /> : <MicOffIcon />}
                                </IconButton>
                                <IconButton onClick={switchCamera} style={{ color: "black" }}>
                                    <FlipCameraIosIcon />
                                </IconButton>
                            </div>
                        </div>
                
                        {/* Other Participant Videos */}
                        {videos.map((video) => (
                            <div key={video.socketId} className={styles.videoContainer}>
                                <video
                                    data-socket={video.socketId}
                                    ref={(ref) => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                ></video>
                            </div>
                        ))}
                    </div>
                
                    {/* Control Buttons */}
                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "black" }}>
                            {video ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton className={styles.endCallButton} onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "black" }}>
                            {audio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>
                
                        {screenAvailable && (
                            <IconButton onClick={handleScreen} style={{ color: "black" }}>
                                {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                        )}
                
                        <Badge badgeContent={newMessages} max={999} color="primary">
                            <IconButton onClick={toggleChat}style={{ color: "black" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>

                        <IconButton onClick={switchCamera} style={{ color: "black" }}>
                            <FlipCameraIosIcon />
                        </IconButton>
                    </div>
                </div>
                

                )}
            </div>
        );
    }        
