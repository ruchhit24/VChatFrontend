import React, { useState, useEffect } from 'react'
import { useMyChatsQuery } from '../redux/api/api';
import { Tooltip } from '@mui/material';
import { IoVideocamSharp } from 'react-icons/io5';

const ChatHeader = ({ chatid }) => {

    const [avatar, setAvatar] = useState("")
    const [name, setName] = useState("")
    const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");
    console.log("chat header =", data)
    const dataToDisplay = data?.transformedChats?.find(chat => chat._id === chatid);
    console.log("display =", dataToDisplay);

    useEffect(() => {
        if (dataToDisplay) {
            setAvatar(dataToDisplay.avatar);
            setName(dataToDisplay.name);
        }
    }, [dataToDisplay]); // Run only when dataToDisplay changes

    return (
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
                {/* Added a div to wrap the icon */}
                <Tooltip title="Video Call" arrow>
                    <div
                        // onClick={handleOpen}
                        className="text-gray-200 w-6 h-6 cursor-pointer mr-8"
                    >
                        <IoVideocamSharp />
                    </div>
                </Tooltip>
            </div>
            {/* {show && <VideoPlayer />} */}
        </div>
    )
}

export default ChatHeader
