import React, { useEffect, useState } from 'react';
import Modal from '@mui/material/Modal';
import { Box, Tooltip } from '@mui/material';
import { IoSearchSharp } from "react-icons/io5";
import { SampleUser } from '../utils/SampleUser';
import { IoIosAddCircle, IoIosRemoveCircle } from "react-icons/io";
import { useInputValidation } from '6pp';
import { useSelector } from 'react-redux';
import { useLazySearchUserQuery, useSendFriendRequestMutation } from '../redux/api/api';
import { toast } from 'react-hot-toast';
import {
  Add as AddIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  height: 500, 
  overflowY: 'auto',  
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const Search = () => {
  const { isSearch } = useSelector((state) => state.misc);

  const [searchUser] = useLazySearchUserQuery();
  const search = useInputValidation('');
  const [data, setData] = useState(null);
  // console.log('data',data)
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(SampleUser);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [isAdded, setIsAdded] = useState({});

  const [sendFriendRequest] = useSendFriendRequestMutation();

  const addFriendHandler = async (id) => {
    setLoading(true); 

    try {
      const res = await sendFriendRequest({ userId: id });

      if (res.data) {
        toast.success("Friend Request Sent");
        setData(res.data);
      } else {
        toast.error(res?.error?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const requestSentHandler = (user) => {
    if (!isAdded[user._id]) {
      addFriendHandler(user._id);
      setIsAdded(prevState => ({ ...prevState, [user._id]: true }));
    }
  }

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      searchUser(search.value)
        .then(({ data }) => setUsers(data?.users))
        .catch((e) => console.log(e));
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
    };
  }, [search.value]);

  return (
    <>
    
    <Tooltip title="Search Friends" arrow>
    <div className='flex items-center'>
    <SearchIcon fontSize='large' className='text-white cursor-pointer hover:text-gray-500' onClick={handleOpen} />
    </div>
    </Tooltip>
       

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h1 className='text-3xl font-semibold text-center mb-3'>Find People</h1>
          <input type='text' value={search.value} onChange={search.changeHandler} className='border w-full p-2 text-black rounded-lg' />
          {
            users && (
              users.map((user) => (
                <div key={user._id} className='flex justify-between items-center mt-4 p-3 border-b-[1px] border-gray-300'>
                  <div className='flex gap-5 items-center text-lg'>
                    <img src={user.avatar} alt='jf' className='h-12 w-12 rounded-full object-cover' />
                    <h1>{user.name}</h1>
                  </div>
                  <div className='text-cyan-500 w-7 h-7 cursor-pointer' onClick={() => requestSentHandler(user)}>
                    {
                      isAdded[user._id] ? (
                        <IoIosRemoveCircle className='text-red-700 w-7 h-7' />
                      ) : (
                        <IoIosAddCircle className='text-cyan-500 w-7 h-7' />
                      )
                    }
                  </div>
                </div>
              ))
            )
          }
        </Box>

      </Modal>
    </>
  )
}

export default Search;
