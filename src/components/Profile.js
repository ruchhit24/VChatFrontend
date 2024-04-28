import React, { useCallback, useEffect, useState } from "react";
import { GrAd } from "react-icons/gr";
import { FaRegUserCircle } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import moment from "moment";
import { useSelector } from "react-redux";
import { useSocket } from "../socket";
import { NEW_VIDEO_REQUEST } from "../constants/events";


const Profile = () => {
  const socket = useSocket();
  const [videoCall,setVideoCall]=useState(false)
  let VideoCall = true
  const videoRequestListener = useCallback((data) => {
    console.log("video call ka dataaaaaaaa==", data);
    // setOnlineUsers(data);
  }, []);
  useEffect(() => {
    socket.on(NEW_VIDEO_REQUEST, videoRequestListener);
    setVideoCall(true)
    return () => {
      socket.off(NEW_VIDEO_REQUEST, videoRequestListener);
      setVideoCall(false)
    };
  }, []);
  const { user } = useSelector((state) => state.auth);
  return (
    <div className="flex justify-center items-center mt-20">
      <div className="flex flex-col gap-2 items-center">
        <img
          src={user?.avatar?.url}
          alt="dh"
          className="h-40 w-40 rounded-full object-cover"
        />
        <div className="flex items-center gap-3 text-white">
          <GrAd className="w-5 h-5" />
          <p className="font-semibold text-lg">{user?.bio}</p>
        </div>

        <span className="text-center text-gray-500 ">bio</span>
        <div className="flex items-center gap-3 text-white">
          <FaRegUserCircle className="w-5 h-5" />
          <p className="font-semibold text-lg">{user?.username}</p>
        </div>

        <span className="text-center text-gray-500 ">username</span>
        <div className="flex items-center gap-3 text-white">
          <FaRegCalendarAlt className="w-5 h-5" />
          <p className="font-semibold text-lg">
          {moment(user?.createdAt).fromNow()}
          </p>
        </div>

        <span className="text-center text-gray-500 ">Joined</span>
        {/* {
          videoCall && (
            <div className="w-80 h-20 bg-white text black">
              ruchit is calling you..
            </div>
          )
        } */}
      </div>
    </div>
  );
};

export default Profile;
