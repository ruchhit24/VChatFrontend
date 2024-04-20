import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "../components/AppLayout";
import { CgAttachment } from "react-icons/cg";
import { IoMdSend } from "react-icons/io";
// import { SampleMessage } from "../utils/SampleMessage";
import MessageComponent from "../components/MessageComponent";
import { useSocket } from "../socket";
import { CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE, START_TYPING, STOP_TYPING } from "../constants/events";
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { Skeleton } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useInfiniteScrollTop } from "6pp";
import FileMenu from "../components/FileMenu";
import { setIsFileMenu } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { TypingLoader } from "../components/TypingLoader";

// const user = {
//   _id : 'yooKiId',
//   name : 'yoo',
// }

const Chat = () => {
  const { user } = useSelector((state) => state.auth);
  //  console.log('user= ',user)

  const params = useParams();
  const { chatId } = params;

  // console.log('chatid',chatId)

  const containerRef = useRef(null);
  const dispatch = useDispatch();

  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  // console.log(userTyping);
  // console.log('i am tyyping',IamTyping)

  const[userChatId,setUserChatId] = useState(null)

  const typingTimeout = useRef(null);

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });

  console.log('chat details = ', chatDetails)

  const members = chatDetails?.data?.chat?.members;

  console.log(members)

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
      setUserChatId(data.chatId)
      console.log('data ki chatid = ',data.chatId)
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


  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <AppLayout>
      <div
        ref={containerRef}
        className="flex flex-col h-[91vh] overflow-y-scroll bg-[url('https://images.unsplash.com/photo-1477840539360-4a1d23071046?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover object-cover"
      >
        <div className="flex-1 flex flex-col p-3 ">
          {allMessages.map((msg) => (
            <MessageComponent message={msg} user={user} key={msg._id} />
          ))}
           
          <div ref={bottomRef} />
        </div>
        {userTyping  && <TypingLoader />}
        <div className="p-3 bg-gray-300">
          <form className="flex items-center" onSubmit={submitHandler}>
            <CgAttachment className="w-8 h-8 mr-2 cursor-pointer" onClick={handleFileOpen} />
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
    </AppLayout>
  );
};

export default Chat;
