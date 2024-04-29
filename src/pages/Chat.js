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
import { Skeleton, TextField, Tooltip } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { Phone, PhoneDisabled } from "@mui/icons-material";
import { toast } from "react-hot-toast"; 
import ChatHeader from "../components/ChatHeader";

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
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const [zp, setZp] = useState(null); // Zego UI Kit instance

  const [show, setShow] = useState(false);

  const { user } = useSelector((state) => state.auth);
  console.log("user from chttt= ", user);

  const userId = user._id

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
  const [otherMemberId, setOtherMemberId] = useState("");

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
  // console.log("other user name = ", otherUserName);

  const members = chatDetails?.data?.chat?.members;
  console.log("members = ", members);
  // sending all members to backend
  useEffect(() => {
    if (members) {
      setOtherMemberId(members[1]);
    }
    socket.emit("getAllMemberSocketsID", { members });
    socket.on("allMembersSocketID", ({ membersSockets }) => {
      setAllMembersSocketid(membersSockets);
    });
  }, [members]);

  // console.log(" memebers of chtttt ", members);

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
        const other = data.transformedChats.filter((val)=>{
          return val._id === chatId
        })
        console.log("other = ", other)
        setNamee(other[0].name);
        setAvatar(other[0].avatar);
      }
    } catch (error) {
      // console.error("An error occurred:", error);

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

  // const allFinalMessages = [ ...data, ...messages, namee , avatar]

  // console.log("all final messags = ", allFinalMessages)
  // video call
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [call, setCall] = useState({});
  const [calling, setCalling] = useState(false);
  const [allMembersSocketid, setAllMembersSocketid] = useState([]);
  // New state to control camera access
  const [cameraActive, setCameraActive] = useState(false);
  useEffect(() => {
    // Check if there's an ongoing call to answer
    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
      handleOpen(); // Open modal when receiving a call
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
 
  const handleOpen = () => {
    setOpen(true);
    // Ensure camera access is activated when the modal is opened
    setCameraActive(true);
    setCamera()
  };
  // useEffect(() => {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true, audio: true })
  //     .then((currentStream) => {
  //       setStream(currentStream);
  //       console.log("current stream =", currentStream);
  //       if (myVideo.current) {
  //         myVideo.current.srcObject = currentStream;
  //       }
  //     });
  // }, [open]);


 const setCamera = ()=>{
  navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((currentStream) => {
    setStream(currentStream);
    console.log("current stream =", currentStream);
    if (myVideo.current) {
      myVideo.current.srcObject = currentStream;
    }
  });
 }
  // useEffect(() => {
  //   // Ensure camera access is only requested when the modal is open and camera is active
  //   if (open && cameraActive) {
  //     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  //       .then((currentStream) => {
  //         setStream(currentStream);
  //         if (myVideo.current) {
  //           myVideo.current.srcObject = currentStream;
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Error accessing camera:', error);
  //       });
  //   }
  // }, [open, cameraActive]);

  useEffect(() => {
    if (call.isReceivingCall) {
      handleOpen();
    } else {
      handleClose();
    }
  }, [call.isReceivingCall]);

  console.log("all members socket idsss = ", allMembersSocketid);

  const [result, setResult] = useState({}); // Initialize result as an object

useEffect(() => {
  // Ensure members and allMembersSocketid are not empty
  if (members?.length > 0 && allMembersSocketid?.length > 0) {
    const res = members.reduce((acc, memberId, index) => {
      acc[memberId] = allMembersSocketid[index];
      return acc;
    }, {});
    setResult(res);
  }
}, [members, allMembersSocketid]); // Include all dependencies

// Log result whenever it changes
useEffect(() => {
  console.log(result);
}, [result]);

 
// Retrieve the socket ID corresponding to the provided user ID
const socketid = result[userId];

console.log('current user socketid = ',socketid); 

// Retrieve the user ID corresponding to the socket ID
const otherUserId = Object.keys(result).find(key => result[key] != socketid);
const otherUserSocketId = result[otherUserId]
console.log('other user socket id = ',otherUserSocketId );

  // Function to handle modal close event
  const handleClose = () => {
    setOpen(false);
    setCallEnded(true); // Set callEnded to true to indicate call end
    stopVideoStream(); // Stop the video stream
    // Ensure camera access is deactivated when the modal is closed
    setCameraActive(false)
  };
  //Function to stop the video stream
  const stopVideoStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null); // Clear the stream state
    }
  };

  const [name, setName] = useState("");
  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  
  const [idToCall, setIdToCall] = useState("");
  console.log("id to call =", idToCall);
  console.log("me ki  id = ", me)
  useEffect(() => {
    setMe(socketid);
    setIdToCall(otherUserSocketId);
  }, [allMembersSocketid]);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });
    console.log("acceptd call");

    peer.on("stream", (currentStream) => {
       if(userVideo.current)
       {
        userVideo.current.srcObject = currentStream;
       }
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    console.log("id getting in calluser function = ", id);
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
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const navigate = useNavigate()
  const leaveCall = () => {
    setCallEnded(true);

    // connectionRef.current.destroy()

    // window.location.href='/'
    navigate("/")
  };

  const onCallHandler = async (id) => {
    setCalling(true);
    callUser(idToCall);
    try {
      const { data } = await axios.put(
        `${server}/api/v1/user/sendVideoRequest`,
        { userId: id },
        {
          withCredentials: true,
        }
      );
      console.log("data of call handler =", data);

      if (data.success) {
        toast.success("calling made..");
      }
    } catch (error) {
      // console.error("An error occurred:", error);

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

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <AppLayout>
      <div
        ref={containerRef}
        className="flex flex-col h-[91vh] bg-[url('https://images.unsplash.com/photo-1477840539360-4a1d23071046?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover object-cover"
      >
         <ChatHeader chatid = {chatId}/>
        <div className="overflow-y-scroll  flex-1 flex flex-col p-3 ">
          {allMessages.map((msg) => (
            <MessageComponent message={msg} user={user} namee={namee} avatar={avatar} key={msg._id} />
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...style, padding: "20px" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
            {stream && (
              <div className="border-2 border-black p-4 rounded-lg shadow-lg">
                <Typography variant="h5" gutterBottom>
                  {name || "You"}
                </Typography>
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  className="w-full md:w-550px rounded-lg"
                />
              </div>
            )}
            {callAccepted && !callEnded && (
              <div className="border-2 border-black p-4 rounded-lg shadow-lg">
                <Typography variant="h5" gutterBottom>
                  {call.name || "Other User"}
                </Typography>
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  className="w-full md:w-550px rounded-lg"
                />
              </div>
            )}
          </div>
          {call.isReceivingCall && !callAccepted ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "20px",
              }}
            >
              <Typography variant="h5" gutterBottom>
                {call.name} is calling...
              </Typography>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : callAccepted && !callEnded ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PhoneDisabled fontSize="large" />}
              fullWidth
              onClick={leaveCall}
              style={{ marginTop: "20px" }}
            >
              Hang Up
            </Button>
          ) : (
            <>
              {calling ? (
                <Typography
                  gutterBottom
                  variant="h6"
                  style={{ marginTop: "20px" }}
                >
                  Calling {otherUserName}...
                </Typography>
              ) : (
                <Typography
                  gutterBottom
                  variant="h6"
                  style={{ marginTop: "20px" }}
                >
                  Make a call
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<Phone fontSize="large" />}
                fullWidth
                onClick={() => onCallHandler(otherMemberId)}
                disabled={calling} // Disable the button while the call is in progress
                style={{ marginTop: "20px" }}
              >
                {calling ? "Calling..." : "Call"}
              </Button>
              {
                calling && (<Button
              variant="contained"
              color="secondary"
              onClick={leaveCall}
              fullWidth
              style={{ marginTop: "20px" }}
            >
              Cancel Call
            </Button>)
              }
            </>
          )}
        </Box>
      </Modal>
    </AppLayout>
  );
};

export default Chat;
