import React, { useState } from "react";
import ChatItem from "./ChatItem";

const ChatList = ({
  chats = [],
  chatId,
  onlineUsers = [],
  newMessagesAlert = [{ chatId: "", count: 0 }],
  handleDeleteChat,
}) => {
  // console.log('online users = ',onlineUsers)
  // console.log('chats = ',chats)
  return (
    <div className="w-full min-h-screen">
      {chats?.map((data, index) => {
        const { avatar, _id, name, groupChat, members } = data;

        const newMessageAlert = newMessagesAlert.find(
          ({ chatId }) => chatId === _id
        );
        const isOnline = members?.some((member) =>
          onlineUsers.includes(member)
        );
        {/* console.log('chatlistm=',isOnline) */}
        return (
          <ChatItem
            avatar={avatar}
            _id={_id}
            name={name}
            groupChat={groupChat}
            members={members}
            sameSender={chatId === _id}
            key={_id}
            isOnline={isOnline}
            newMessageAlert={newMessageAlert}
            handleDeleteChat={handleDeleteChat}
            index={index}
          />
        );
      })}
    </div>
  );
};

export default ChatList;
