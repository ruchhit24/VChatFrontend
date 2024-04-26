import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "../components/AppLayout";
import { CgAttachment } from "react-icons/cg";
import { IoMdSend } from "react-icons/io";
// import { SampleMessage } from "../utils/SampleMessage";
import MessageComponent from "../components/MessageComponent";
import { useSocket } from "../socket";
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
} from "../constants/events";
import {
  useChatDetailsQuery,
  useGetMessagesQuery,
  useMyChatsQuery,
} from "../redux/api/api";
import { Skeleton, Tooltip } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { isValidUsername, useInfiniteScrollTop } from "6pp";
import FileMenu from "../components/FileMenu";
import { setIsFileMenu } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { TypingLoader } from "../components/TypingLoader";
import axios from "axios";
import { server } from "../constants/config";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { ZIM } from "zego-zim-web";
import { IoVideocamSharp } from "react-icons/io5";
import VideoPlayer from "../components/VideoPlayer";
import { Grid, Paper, Typography } from "@mui/material";
import Peer from "simple-peer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  height: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Chat = () => {
  const [zp, setZp] = useState(null); // Zego UI Kit instance

  const [show, setShow] = useState(false);

  const { user } = useSelector((state) => state.auth);
  console.log("user from chttt= ", user);

  const params = useParams();
  const { chatId } = params;

  // console.log('chatid',chatId)

  // console.log("prop ka data = ",dataa)

  const containerRef = useRef(null);
  const dispatch = useDispatch();

  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [namee, setNamee] = useState("");
  const [avatar, setAvatar] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  // console.log(userTyping);
  // console.log('i am tyyping',IamTyping)

  const [userChatId, setUserChatId] = useState(null);

  const typingTimeout = useRef(null);

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });

  console.log("chat details = ", chatDetails);

  const fullNameOfBothUser = chatDetails?.data?.chat?.name;
  const otherUserName = fullNameOfBothUser?.split(" - ")[1];
  console.log("other user name = ", otherUserName);

  const members = chatDetails?.data?.chat?.members;

  console.log(" memebers of chtttt ", members);

  const messageOnChange = (e) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, [2000]);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    // console.log('message =',message);

    if (!message.trim()) return;

    // Emitting the message to the server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  };

  const newMessageHandler = useCallback(
    (data) => {
      // console.log(data);

      if (data.chatId !== chatId) {
        return;
      }
      setMessages((prev) => [...prev, data.message]);
    },
    [chatId]
  );

  useEffect(() => {
    socket.on(NEW_MESSAGE, newMessageHandler);
    return () => {
      socket.off(NEW_MESSAGE, newMessageHandler);
    };
  }, [chatId]);

  const [page, setPage] = useState(1);
  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });
  // console.log(oldMessagesChunk);

  const { data, setData } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  );

  // console.log('old messages',data);

  const allMessages = [...data, ...messages];

  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  useEffect(() => {
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setData([]);
      setPage(1);
    };
  }, [chatId]);

  const startTypingListener = useCallback(
    (data) => {
      setUserChatId(data.chatId);
      console.log("data ki chatid = ", data.chatId);
      if (data.chatId !== chatId) return;
      console.log("start-typing", data);
      setUserTyping(true);
    },
    [chatId]
  );

  useEffect(() => {
    socket.on(START_TYPING, startTypingListener);
    return () => {
      socket.off(START_TYPING, startTypingListener);
    };
  }, [chatId]);

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      console.log("stop-typing", data);
      setUserTyping(false);
    },
    [chatId]
  );
  useEffect(() => {
    socket.on(STOP_TYPING, stopTypingListener);
    return () => {
      socket.off(STOP_TYPING, stopTypingListener);
    };
  }, [chatId]);

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setData([]);
      setPage(1);
      socket.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    // Emitting the message to the server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${server}/api/v1/chat/my`, {
        withCredentials: true,
      });
      console.log("fetched data = ", data);

      if (data.success) {
        setNamee(data?.transformedChats[0]?.name);
        setAvatar(data?.transformedChats[0]?.avatar);
      }
    } catch (error) {
      console.error("An error occurred:", error);

      if (error.response && error.response.data) {
        const { data } = error.response;
        if (!data.success) {
          console.error("Error:", data.error);
        } else {
          console.error("Error:", error.response.data);
        }
      } else {
        console.error("Unknown error occurred:", error);
      }
    }
  };

  // useEffect(() => {
  //   const initializeZego = async () => {
  //     await initZego();
  //   };

  //   initializeZego();
  // }, []);

  // const initZego = async() => {
  //   try {

  //        // Initialize Zego UI Kit with your SDK credentials
  //     const userID = "34"
  //     const userName = user.name;
  //   console.log("userid = " + userID + "username =" ,userName)
  //     // Check if members array is defined before accessing its elements
  //     if (!userID) {
  //       console.error('Members array is undefined or empty.');
  //       return;
  //     }

  //     const KitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
  //       process.env.REACT_APP_ID,
  //       process.env.REACT_APP_SERVERR,
  //       null,
  //       userID,
  //       userName
  //     );

  //     const zpInstance = ZegoUIKitPrebuilt.create(KitToken);
  //     zpInstance.addPlugins({ ZIM });

  //     console.log('Zego UI Kit initialized successfully:', zpInstance);
  //     setZp(zpInstance);

  //   } catch (error) {
  //     console.error('Error initializing Zego UI Kit:', error);
  //   }
  // };

  // const handleVideoCall = () => {
  //   if (!zp) {
  //     console.error('Zego UI Kit is not initialized.');
  //     return;
  //   }

  //   const calleeID = members[1]; // Replace with your friend's user ID
  //   const calleeName =otherUserName   // Replace with your friend's user name

  //   zp.sendCallInvitation({
  //     callees: [{ userID: calleeID, userName: calleeName }],
  //     callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
  //     timeout: 60,
  //   }).then((res) => {
  //     console.warn(res);
  //     if (res.errorInvitees.length) {
  //       alert('The user does not exist or is offline.');
  //     }
  //   }).catch((err) => {
  //     console.error(err);
  //   });
  // };

  // video call
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
                  myVideo.current.srcObject = currentStream;
                }
        
      })
      .catch((err) => console.error('Error accessing camera:', err));
          socket.on("me", (id) => setMe(id));

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
  })
}
   // Function to handle modal close event
   const handleClose = () => {
    setOpen(false);
    setCallEnded(true); // Set callEnded to true to indicate call end
    stopVideoStream(); // Stop the video stream
  };
    // Function to stop the video stream
    const stopVideoStream = () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };

  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");
  const [name, setName] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // useEffect(() => {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true, audio: true })
  //     .then((currentStream) => {
  //       setStream(currentStream);

  //       if (myVideo.current) {
  //         myVideo.current.srcObject = currentStream;
  //       }
  //     });

  //   socket.on("me", (id) => setMe(id));

  //   socket.on("callUser", ({ from, name: callerName, signal }) => {
  //     setCall({ isReceivingCall: true, from, name: callerName, signal });
  //   });
  //   return () => {
  //     if (stream) {
  //       stream.getTracks().forEach(track => track.stop());
  //     }
  //   };
  // }, []);

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

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <AppLayout>
      <div
        ref={containerRef}
        className="flex flex-col h-[91vh] bg-[url('https://images.unsplash.com/photo-1477840539360-4a1d23071046?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover object-cover"
      >
        <div className="p-3 bg-zinc-800 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt="dj"
              className="w-12 h-12 object-cover rounded-full shadow-lg"
            />

            <h2 className="font-semibold text-lg text-white ">{name}</h2>
          </div>

          <div>
            {" "}
            {/* Added a div to wrap the icon */}
            <Tooltip title="Video Call" arrow>
              <div
                onClick={handleOpen}
                className="text-gray-200 w-6 h-6 cursor-pointer mr-8"
              >
                <IoVideocamSharp />
              </div>
            </Tooltip>
          </div>
          {show && <VideoPlayer />}
        </div>
        <div className="overflow-y-scroll  flex-1 flex flex-col p-3 ">
          {allMessages.map((msg) => (
            <MessageComponent message={msg} user={user} key={msg._id} />
          ))}

          <div ref={bottomRef} />
        </div>
        {userTyping && <TypingLoader />}
        <div className="p-3 bg-gray-300">
          <form className="flex items-center" onSubmit={submitHandler}>
            <CgAttachment
              className="w-8 h-8 mr-2 cursor-pointer"
              onClick={handleFileOpen}
            />
            <input
              placeholder="Type some message here.."
              value={message}
              onChange={messageOnChange}
              className="flex-1 p-2 border border-gray-400 rounded-lg"
            />
            <button type="submit" className="ml-2" onClick={sendMessage}>
              <IoMdSend className="w-8 h-8" />
            </button>
          </form>
          <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />
        </div>
      </div>
      <div></div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
            {stream && (
              <div className="border-2 border-black p-4">
                <Typography variant="h5" gutterBottom>
                  {name || "You"}
                </Typography>
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  className="w-full md:w-550px"
                />
              </div>
            )}
            {callAccepted && !callEnded && (
              <div className="border-2 border-black p-4">
                <Typography variant="h5" gutterBottom>
                  {call.name || "Other User"}
                </Typography>
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  className="w-full md:w-550px"
                />
              </div>
            )}
          </div>
        </Box>
      </Modal>
    </AppLayout>
  );
};

export default Chat;
