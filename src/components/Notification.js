import React, { useState } from 'react';
import { FaRegBell } from "react-icons/fa"; 
import Modal from '@mui/material/Modal';
import { Box, Tooltip } from '@mui/material';  
import { useAcceptFriendRequestMutation, useGetNotificationsQuery } from '../redux/api/api';
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import { setIsNotification } from '../redux/reducers/misc';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { resetNotificationCount } from '../redux/reducers/chat';
import {
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useSocket } from '../socket';
import { IoRefresh } from "react-icons/io5";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const Notification = () => {

  const dispatch = useDispatch();

  const socket = useSocket();
  
  const { isNotification } = useSelector((state) => state.misc); 

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    const { isLoading, data, error, isError } = useGetNotificationsQuery();
   console.log('notification ka data = ',data)

   const [acceptRequest] = useAcceptFriendRequestMutation();
  
   const friendRequestHandler = async ({ idd, accept }) => {
    dispatch(setIsNotification(false));
     try{
      const res = await acceptRequest({requestId : idd,accept})
      console.log('res= ',res);
      if (res.data?.success) {
        // console.log("we need to use sockets here");
        toast.success(res.data.message);
         
      } else {
        toast.error(res.error.data.message || "Something went wrong");
      }
  }
catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  }
  const openNotification = () => {
    dispatch(setIsNotification(true)); 
    dispatch(resetNotificationCount()); 
  };

  
  const closeHandler = () => dispatch(setIsNotification(false));

  const refreshHandler = ()=>{
    dispatch(setIsNotification(true))
    window.location.reload() ;  
  }
    return (
        <>
            
            <Tooltip title="Notifications" arrow>
    <NotificationsIcon fontSize='large' className='text-white w-6 h-6 cursor-pointer hover:text-gray-500' onClick={openNotification}/>
    </Tooltip>  
            <Modal
                open={isNotification}
                onClose={closeHandler}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                     <div className='flex flex-row justify-between'>
                      
                     {data?.requests?.length === 0 ? (
  <div className="flex flex-col items-center">
    <h2 className="text-2xl font-semibold text-center mb-3">
      Click Below Refresh Icon if not able to see New Notifications
    </h2>
    <button
      className="flex items-center justify-center bg-transparent border-none focus:outline-none"
      style={{ width: '50px', height: '50px' }} // Adjust size as needed
      onClick={refreshHandler}
    >
      <IoRefresh style={{ fontSize: '2rem' }} /> {/* Adjust icon size as needed */}
    </button>
  </div>
) : (
  <h1 className="text-3xl font-semibold text-center mb-3">Notifications</h1>
)}

                     
                     </div>

                    {isError && <div>Error: {error.message}</div>}
                    {isLoading && <div>Loading...</div>}
                    {
                        data?.requests?.length > 0 ? (
                            data?.requests.map((x) => (
                                <div key={x._id} className='flex justify-between items-center mt-4 p-3 border-b-[1px] border-gray-300'>
                                    <div className='flex gap-5 items-center text-lg'>
                                        <img src={x.sender.avatar} alt='jf' className='h-12 w-12 rounded-full object-cover'/>
                                        <h1>{`${x.sender.name} sends you a Request`}</h1>
                                    </div> 
                                    <div className='flex items-center gap-3'>
                                    <TiTick className='h-10 w-10 text-green-700' onClick={()=> friendRequestHandler({ idd : x._id , accept : true})}/>
                                   <RxCross2 className='h-10 w-10 text-red-600' onClick={()=> friendRequestHandler({ idd : x._id , accept : false})}/>
                                    </div>
                                </div>
                            ))
                        ) : <div>No notifications</div>
                    }
                </Box>
            </Modal>
        </>
    );
};

export default Notification;
