import React from "react";
import { FaUserGroup } from "react-icons/fa6";
import { PiSignOutBold } from "react-icons/pi";
import Search from "./Search";
import Notification from "./Notification";
import NewGroup from "./NewGroup";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import { userNotExists } from "../redux/reducers/auth.js";
import { server } from "../constants/config.js";
import {
  setIsNewGroup,
  setIsNotification,
  setIsSearch,
} from "../redux/reducers/misc";
import { resetNotificationCount } from "../redux/reducers/chat";
import { Badge, Tooltip } from "@mui/material";
import {
  Add as AddIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

const Header = () => {
  const dispatch = useDispatch();

  const { notificationCount } = useSelector((state) => state.chat);

  const { isSearch, isNotification, isNewGroup } = useSelector(
    (state) => state.misc
  );

  const openSearch = () => dispatch(setIsSearch(true));

  const openNewGroup = () => {
    dispatch(setIsNewGroup(true));
  };

  const openNotification = () => {
    dispatch(setIsNotification(true)); 
    dispatch(resetNotificationCount()); 
  };

  const logoutHandler = async () => {
    try {
      const { data } = await axios.get(`${server}/api/v1/user/logout`, {
        withCredentials: true,
      });
      dispatch(userNotExists());
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="text-3xl bg-gray-800 h-[4rem] w-full px-8 flex justify-between">
      <div className="flex items-center">
        <img
          src="https://static.vecteezy.com/system/resources/previews/022/359/490/original/3d-chat-icon-png.png"
          className="h-10 w-10"
          alt="fd"
        />
        <h2 className="bg-gradient-to-r from-cyan-800 to-cyan-500 text-xl font-bold text-gray-100 leading-none tracking-wider p-2 rounded-r-full">
          VChat
        </h2>
      </div>
      <div className="flex gap-8 items-center justify-center">
        <Search onClick={openSearch} />

        <NewGroup onClick={openNewGroup} />
        <Link to={"/groups"}>
          <Tooltip title="groups" arrow>
            <GroupIcon
              fontSize="large"
              className="text-white w-7 h-7 flex items-center cursor-pointer hover:text-gray-500"
            />
          </Tooltip>
        </Link>
        {/* {notificationCount ? (
          <Badge badgeContent={notificationCount} color="error">
            <NotificationsIcon fontSize='large' className='text-white w-6 h-6 cursor-pointer hover:text-gray-500' onClick={openNotification}/>
          </Badge>
        ) : (
          <NotificationsIcon fontSize='large' className='text-white w-6 h-6 cursor-pointer hover:text-gray-500' onClick={openNotification}/>
        )} */}
        <Link to={"/notifications"}>
        <Tooltip title="Notifications" arrow>
        {notificationCount ? (
          <Badge badgeContent={notificationCount} color="error">
            <NotificationsIcon fontSize='large' className='text-white w-6 h-6 cursor-pointer hover:text-gray-500' onClick={openNotification}/>
          </Badge>
        ) : (
          <NotificationsIcon fontSize='large' className='text-white w-6 h-6 cursor-pointer hover:text-gray-500' onClick={openNotification}/>
        )}
    </Tooltip>
        </Link>

        <PiSignOutBold
          className="text-white w-6 h-6 cursor-pointer hover:text-gray-500"
          onClick={logoutHandler}
        />
      </div>
    </div>
  );
};

export default Header;
