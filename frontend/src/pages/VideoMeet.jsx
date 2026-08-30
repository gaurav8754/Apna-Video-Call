import React, { useContext, useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Box, Paper, Typography, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';
import { AuthContext } from '../contexts/AuthContext';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {
    const { addToUserHistory } = useContext(AuthContext);

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(true);

    let [audio, setAudio] = useState(true);

    let [screen, setScreen] = useState(false);

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState(false);

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState(localStorage.getItem("username") || "");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

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
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        console.log("Initializing Permissions");
        getPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ✅ runs only once

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
        console.log("HERE")
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
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

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
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

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

   let handleVideo = () => {
    if (window.localStream) {
        const videoTrack = window.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setVideo(videoTrack.enabled);
        }
    }
};

let handleAudio = () => {
    if (window.localStream) {
        const audioTrack = window.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setAudio(audioTrack.enabled);
        }
    }
};



    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    // eslint-disable-next-line no-unused-vars
    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    // eslint-disable-next-line no-unused-vars
    let closeChat = () => {
        setModal(false);
    }
    // eslint-disable-next-line no-unused-vars
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data, socketIdSender: socketIdSender }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        if (!message.trim()) return;
        const senderName = username.trim() || localStorage.getItem("username") || "You";
        socketRef.current.emit('chat-message', message, senderName);
        setMessage("");
    };

    
    let connect = async () => {
        setAskForUsername(false);
        getMedia();
        try {
            const pathParts = window.location.pathname.split("/").filter(Boolean);
            const meetingCode = pathParts[pathParts.length - 1];
            if (meetingCode && addToUserHistory) {
                await addToUserHistory(meetingCode);
            }
        } catch (e) {
            console.error("Error saving meeting to history:", e);
        }
    };


    return (
        <div>

            {askForUsername === true ?
                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#ffffff",
                        backgroundImage: "radial-gradient(circle at 50% 30%, rgba(217, 117, 0, 0.05) 0%, transparent 60%)",
                        padding: 3,
                    }}
                >
                    <Paper
                        elevation={12}
                        sx={{
                            maxWidth: 520,
                            width: "100%",
                            borderRadius: "24px",
                            padding: { xs: 3, sm: 4 },
                            backgroundColor: "#09090b",
                            border: "1px solid rgba(217, 117, 0, 0.3)",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(217, 117, 0, 0.2)",
                            color: "#ffffff",
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: "#ffffff",
                                mb: 1,
                                letterSpacing: "-0.5px",
                            }}
                        >
                            Entering Lobby
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: "#a1a1aa",
                                mb: 3.5,
                            }}
                        >
                            Check your camera preview and enter your display name to connect.
                        </Typography>

                        {/* Video Camera Preview Card */}
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                borderRadius: "16px",
                                overflow: "hidden",
                                border: "1px solid rgba(217, 117, 0, 0.2)",
                                boxShadow: "0 12px 24px -6px rgba(0, 0, 0, 0.6)",
                                mb: 3.5,
                                aspectRatio: "16 / 9",
                                backgroundColor: "#000000",
                            }}
                        >
                            <video 
                                ref={ref => {
                                    if (ref) {
                                        localVideoref.current = ref;
                                        if (window.localStream && ref.srcObject !== window.localStream) {
                                            ref.srcObject = window.localStream;
                                        }
                                    }
                                }} 
                                autoPlay 
                                muted
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transform: "scaleX(-1)",
                                }}
                            ></video>
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 12,
                                    left: 12,
                                    backgroundColor: "rgba(9, 9, 11, 0.8)",
                                    backdropFilter: "blur(6px)",
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    fontSize: "0.8rem",
                                    fontWeight: 500,
                                    color: "#ffffff",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                                Camera Preview
                            </Box>
                        </Box>

                        {/* Input Box & Connect Button */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: 2,
                                alignItems: "stretch",
                            }}
                        >
                            <TextField 
                                fullWidth
                                id="outlined-basic" 
                                label="Your Display Name" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                variant="outlined" 
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        color: "#ffffff",
                                        fontWeight: 600,
                                        backgroundColor: "rgba(24, 24, 27, 0.6)",
                                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.15)" },
                                        "&:hover fieldset": { borderColor: "#FF8C00" },
                                        "&.Mui-focused fieldset": { borderColor: "#D97500" },
                                    },
                                    "& .MuiInputLabel-root": { color: "#a1a1aa" },
                                    "& .MuiInputLabel-root.Mui-focused": { color: "#D97500" },
                                }}
                            />
                            <Button 
                                variant="contained" 
                                onClick={connect}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: "12px",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    textTransform: "none",
                                    whiteSpace: "nowrap",
                                    background: "linear-gradient(135deg, #FF8C00 0%, #D97500 100%)",
                                    boxShadow: "0 8px 20px -4px rgba(217, 117, 0, 0.5)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #e07b00 0%, #c66a00 100%)",
                                        boxShadow: "0 12px 25px -4px rgba(217, 117, 0, 0.7)",
                                        transform: "translateY(-1px)",
                                    },
                                }}
                            >
                                Connect & Join
                            </Button>
                        </Box>
                    </Paper>
                </Box> :


                <div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>

                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>

                            <div className={styles.chattingDisplay}>

                                {messages.length !== 0 ? messages.map((item, index) => {
                                    const isMe = item.socketIdSender === socketIdRef.current || (item.sender && item.sender === username);
                                    const displayName = item.sender ? item.sender : (isMe ? "You" : "Participant");

                                    return (
                                        <div style={{ marginBottom: "16px" }} key={index}>
                                            <p style={{ fontWeight: "bold", color: isMe ? "#4f46e5" : "#0f172a", marginBottom: "2px" }}>
                                                {displayName} {isMe ? "(You)" : ""}
                                            </p>
                                            <p style={{ margin: 0, color: "#334155" }}>{item.data}</p>
                                        </div>
                                    );
                                }) : <p>No Messages Yet</p>}


                            </div>

                            <div className={styles.chattingArea}>
                                <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>


                        </div>
                    </div> : <></>}


                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />                        </IconButton>
                        </Badge>

                    </div>


                    <video 
                        className={styles.meetUserVideo} 
                        ref={ref => {
                            if (ref) {
                                localVideoref.current = ref;
                                if (window.localStream && ref.srcObject !== window.localStream) {
                                    ref.srcObject = window.localStream;
                                }
                            }
                        }} 
                        autoPlay 
                        muted
                    ></video>

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream && ref.srcObject !== video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                >
                                </video>
                            </div>

                        ))}

                    </div>

                </div>

            }

        </div>
    )
}