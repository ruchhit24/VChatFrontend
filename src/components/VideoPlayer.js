// import { AgoraVideoPlayer, createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";
// import VideoCall from "./VideoCall";
// import { Button } from "@mui/material";
// import { useState } from "react";


// const VideoPlayer = ()=>{
//   const [inCall, setInCall] = useState(false);

//   return (
//     <div className="App" style={{ height: "100%" }}>
//       {inCall ? (
//         <VideoCall setInCall={setInCall} />
//       ) : (
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => setInCall(true)}
//         >
//           Join Call
//         </Button>
//       )}
//     </div>
//   );
// }

// export default VideoPlayer






























// // // VideoPlayer.js
// // import React from 'react';
// // import { useDispatch, useSelector } from 'react-redux';
// // import { toggleIsVideo } from '../redux/reducers/misc';
// // import { IoMdArrowBack } from 'react-icons/io';
// //  // Adjust the path

// // const VideoPlayer = () => {
// //   const dispatch = useDispatch(); 

// //   // const handleToggle = () => {
// //   //   dispatch(toggleIsVideo());
// //   // };

// //   const goBack = ()=>{
// //     dispatch(toggleIsVideo(false))
// //   }

// //   return (
// //     <div>
// //     <div className="bg-zinc-800 w-12 h-12 absolute top-4 left-2 rounded-full flex items-center cursor-pointer hover:bg-gray-500 shadow-lg mt-16">
          
// //             <IoMdArrowBack className="w-10 h-10 text-white pl-1" onClick={goBack}/>
           
// //           </div>
// //     </div>
// //   );
// // };

// // export default VideoPlayer;

// import React, { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { toggleIsVideo } from '../redux/reducers/misc';
// import { IoMdArrowBack } from 'react-icons/io';
// import AgoraRTM from 'agora-rtm-sdk';


// const VideoCall = () => {
//   const { room } = useParams();
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [peerConnection, setPeerConnection] = useState(null);
//   const [isMicEnabled, setIsMicEnabled] = useState(true);
//   const [isCameraEnabled, setIsCameraEnabled] = useState(true);
//     const dispatch = useDispatch(); 

//   // const handleToggle = () => {
//   //   dispatch(toggleIsVideo());
//   // };

//   const goBack = ()=>{
//     dispatch(toggleIsVideo(false))
//   }
//   const toggleCamera = async () => {
//     const videoTrack = localStream.getTracks().find(track => track.kind === 'video');

//     if (videoTrack.enabled) {
//       videoTrack.enabled = false;
//       setIsCameraEnabled(false);
//     } else {
//       videoTrack.enabled = true;
//       setIsCameraEnabled(true);
//     }
//   };

//   const toggleMic = async () => {
//     const audioTrack = localStream.getTracks().find(track => track.kind === 'audio');

//     if (audioTrack.enabled) {
//       audioTrack.enabled = false;
//       setIsMicEnabled(false);
//     } else {
//       audioTrack.enabled = true;
//       setIsMicEnabled(true);
//     }
//   };

//   useEffect(() => {
//     const APP_ID = process.env.REACT_AGORA_APP_ID;
//     const token = null;
//     const uid = String(Math.floor(Math.random() * 10000));

//     let client;
//     let channel;
//     const queryString = window.location.search;
//     const urlParams = new URLSearchParams(queryString);
//     const roomId = urlParams.get('room');

//     const servers = {
//       iceServers: [
//         {
//           urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
//         }
//       ]
//     };

//     const constraints = {
//       video: {
//         width: { min: 640, ideal: 1920, max: 1920 },
//         height: { min: 480, ideal: 1080, max: 1080 },
//       },
//       audio: true
//     };

//     const init = async () => {
//       client = await AgoraRTM.createInstance(APP_ID);
//       await client.login({ uid, token });

//       channel = client.createChannel(roomId);
//       await channel.join();

//       channel.on('MemberJoined', handleUserJoined);
//       channel.on('MemberLeft', handleUserLeft);

//       client.on('MessageFromPeer', handleMessageFromPeer);

//       localStream = await navigator.mediaDevices.getUserMedia(constraints);
//       setLocalStream(localStream);
//       localVideoRef.current.srcObject = localStream;
//     };

//     const handleUserLeft = (MemberId) => {
//       remoteVideoRef.current.style.display = 'none';
//       localVideoRef.current.classList.remove('smallFrame');
//     };

//     const handleMessageFromPeer = async (message, MemberId) => {
//       message = JSON.parse(message.text);

//       if (message.type === 'offer') {
//         createAnswer(MemberId, message.offer);
//       }

//       if (message.type === 'answer') {
//         addAnswer(message.answer);
//       }

//       if (message.type === 'candidate') {
//         if (peerConnection) {
//           peerConnection.addIceCandidate(message.candidate);
//         }
//       }
//     };

//     const handleUserJoined = async (MemberId) => {
//       console.log('A new user joined the channel:', MemberId);
//       createOffer(MemberId);
//     };

//     const createPeerConnection = async (MemberId) => {
//       peerConnection = new RTCPeerConnection(servers);

//       remoteStream = new MediaStream();
//       remoteVideoRef.current.srcObject = remoteStream;
//       remoteVideoRef.current.style.display = 'block';

//       localVideoRef.current.classList.add('smallFrame');

//       if (!localStream) {
//         localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         localVideoRef.current.srcObject = localStream;
//       }

//       localStream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, localStream);
//       });

//       peerConnection.ontrack = (event) => {
//         event.streams[0].getTracks().forEach((track) => {
//           remoteStream.addTrack(track);
//         });
//       };

//       peerConnection.onicecandidate = async (event) => {
//         if (event.candidate) {
//           client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId);
//         }
//       };
//     };

//     const createOffer = async (MemberId) => {
//       await createPeerConnection(MemberId);

//       const offer = await peerConnection.createOffer();
//       await peerConnection.setLocalDescription(offer);

//       client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, MemberId);
//     };

//     const createAnswer = async (MemberId, offer) => {
//       await createPeerConnection(MemberId);

//       await peerConnection.setRemoteDescription(offer);

//       const answer = await peerConnection.createAnswer();
//       await peerConnection.setLocalDescription(answer);

//       client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, MemberId);
//     };

//     const addAnswer = async (answer) => {
//       if (!peerConnection.currentRemoteDescription) {
//         peerConnection.setRemoteDescription(answer);
//       }
//     };

//     const leaveChannel = async () => {
//       await channel.leave();
//       await client.logout();
//     };

 

//     window.addEventListener('beforeunload', leaveChannel);

//     init();

//     return () => {
//       window.removeEventListener('beforeunload', leaveChannel);
//     };
//   }, []);

//   return (
//     <div>
//      <div className="bg-zinc-800 w-12 h-12 absolute top-4 left-2 rounded-full flex items-center cursor-pointer hover:bg-gray-500 shadow-lg mt-16">
          
//                       <IoMdArrowBack className="w-10 h-10 text-white pl-1" onClick={goBack}/>
                     
//                      </div>
//       <video ref={localVideoRef} autoPlay muted />
//       <video ref={remoteVideoRef} autoPlay />
//       <button id="mic-btn" onClick={toggleMic}>
//         {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
//       </button>
//       <button id="camera-btn" onClick={toggleCamera}>
//         {isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
//       </button>
//     </div>
//   );
// };

// export default VideoCall;







































































import { Grid, Paper, Typography} from "@mui/material"; 
import {  useMemo,  useState, useRef, useEffect } from "react"; 
import { useSocket } from "../socket";
import Peer from "simple-peer";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'; 
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
 

const VideoPlayer = () => { 

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  

 const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");

  const socket = useSocket();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
 

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);

        if (myVideo.current) {
            myVideo.current.srcObject = currentStream;
          }
      });

    socket.on("me", (id) => setMe(id));

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();

    window.location.reload();
  };
  return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
//     {stream && (
//       <div className="border-2 border-black p-4">
//         <Typography variant="h5" gutterBottom>{name || 'Name'}</Typography>
//         <video playsInline muted ref={myVideo} autoPlay className="w-full md:w-550px" />
//       </div>
//     )}
//     {callAccepted && !callEnded && (
//       <div className="border-2 border-black p-4">
//         <Typography variant="h5" gutterBottom>{call.name || 'Name'}</Typography>
//         <video playsInline ref={userVideo} autoPlay className="w-full md:w-550px" />
//       </div>
//     )}
//   </div>
    <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal>
  )
}

export default VideoPlayer