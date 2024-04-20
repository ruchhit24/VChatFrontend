import React, { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ChatItem = ({
  avatar,
  name,
  _id,
  groupChat = false,
  sameSender,
  isOnline,
  newMessageAlert,
  index = 0,
  handleDeleteChat,
}) => {
  // console.log(isOnline)
  return (
    <Link
      to={`/chat/${_id}`}
      onContextMenu={(e) => handleDeleteChat(e, _id, groupChat)}
    >
      <motion.div
        initial={{ opacity: 0, y: "-100%" }}
        whileInView={{ opacity: 1, y: 0 }}
        className="p-3 border-b-[1px] border-gray-400 flex items-center justify-between gap-3 hover:bg-gray-300 relative"
        style={{
          backgroundColor: sameSender ? "black" : "unset",
          color: sameSender ? "white" : "unset",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt="dj"
              className="w-12 h-12 object-cover rounded-full "
            />

            <h2 className="font-semibold text-lg">{name}</h2>
          </div>
        </div>
        {newMessageAlert && (
          <div className="p-2 bg-gray-400 rounded-full">
            <h2 className="font-bold text-xs">
              {newMessageAlert.count} New Message
            </h2>
          </div>
        )}
        {isOnline && (
          <div className="h-2 w-2 rounded-full bg-green-800 absolute top-1/2 right-4" />
        )}
      </motion.div>
    </Link>
  );
};

export default memo(ChatItem);
