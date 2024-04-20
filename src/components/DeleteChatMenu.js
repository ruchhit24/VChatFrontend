import { Menu, Stack, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { setIsDeleteMenu } from "../redux/reducers/misc";
import {
  Delete as DeleteIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDeleteChatMutation, useLeaveGroupMutation } from "../redux/api/api";
import { toast } from "react-hot-toast";
 

const DeleteChatMenu = ({ dispatch, deleteMenuAnchor }) => {
  const navigate = useNavigate();

  const { isDeleteMenu, selectedDeleteChat } = useSelector(
    (state) => state.misc
  );

  const [unfriend] = useDeleteChatMutation()

  const unfriendHandler = async()=>{
    try {
        const res = await unfriend( selectedDeleteChat.chatId );
        console.log(res);
  
        if (res.data) {
          toast.success("friend removed!!");
        } else {
          toast.error(res?.error?.data?.message || "Something went wrong");
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    };
    
    const [leaveGroup] = useLeaveGroupMutation();
    const groupChodoHandler = async()=>{
        try {
            const res = await leaveGroup( selectedDeleteChat.chatId );
            console.log(res);
      
            if (res.data) {
              toast.success("Leaved from the Group!!");
            } else {
              toast.error(res?.error?.data?.message || "Something went wrong");
            }
          } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
          }
        };

  const isGroup = selectedDeleteChat.groupChat;

  const closeHandler = () => {
    dispatch(setIsDeleteMenu(false));
    deleteMenuAnchor.current = null;
  };

  const leaveGroupHandler = () => {
    closeHandler();
    groupChodoHandler();
    navigate("/")
    
  };

  const deleteChatHandler = () => {
    closeHandler();
    unfriendHandler();
    navigate("/")
  };

 

  return (
    <Menu
      open={isDeleteMenu}
      onClose={closeHandler}
      anchorEl={deleteMenuAnchor.current}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
    >
      <Stack
        sx={{
          width: "10rem",
          padding: "0.5rem",
          cursor: "pointer",
        }}
        direction={"row"}
        alignItems={"center"}
        spacing={"0.5rem"}
        onClick={isGroup ? leaveGroupHandler : deleteChatHandler}
      >
        {isGroup ? (
          <>
            <ExitToAppIcon />
            <Typography>Leave Group</Typography>
          </>
        ) : (
          <>
            <DeleteIcon />
            <Typography>Unfriend</Typography>
          </>
        )}
      </Stack>
    </Menu>
  );
};

export default DeleteChatMenu;