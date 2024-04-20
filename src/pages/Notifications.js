import { Box } from "@mui/material";
import React from "react";
import { toast } from "react-hot-toast";
import { IoMdArrowBack } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import { Link } from "react-router-dom";
import {
  useAcceptFriendRequestMutation,
  useGetNotificationsQuery,
} from "../redux/api/api";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Notifications = () => {
 

  const { isLoading, data, error, isError } = useGetNotificationsQuery();
  console.log("notification ka data = ", data);

  const [acceptRequest] = useAcceptFriendRequestMutation();

  const friendRequestHandler = async ({ idd, accept }) => {
    // dispatch(setIsNotification(false));
    window.location.href = "/";
    try {
      const res = await acceptRequest({ requestId: idd, accept });
      console.log("res= ", res);
      if (res.data?.success) {
        // console.log("we need to use sockets here");
        toast.success(res.data.message);
      } else {
        toast.error(res.error.data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <div>
        <Box sx={style}>
          <div className="flex flex-col">
            <Link to={"/"}>
              <div className="flex items-center p-2 bg-gray-700 text-white py-2 w-32 rounded-lg hover:bg-gray-500">
                <IoMdArrowBack className="w-8 h-8 text-gray-400" />
                <h1>Go Back</h1>
              </div>
            </Link>

            <h1 className="text-3xl font-semibold text-center mb-3 pb-2 border-b-2 border-gray-400">
              Notifications
            </h1>
          </div>

          {isError && <div>Error: {error.message}</div>}
          {isLoading && <div>Loading...</div>}
          {data?.requests?.length > 0 ? (
            data?.requests.map((x) => (
              <div
                key={x._id}
                className="flex justify-between items-center mt-4 p-3 border-b-[1px] border-gray-300"
              >
                <div className="flex gap-5 items-center text-lg">
                  <img
                    src={x.sender.avatar}
                    alt="jf"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <h1>{`${x.sender.name} sends you a Request`}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <TiTick
                    className="h-10 w-10 text-green-700 cursor-pointer hover:scale-110 duration-700"
                    onClick={() =>
                      friendRequestHandler({ idd: x._id, accept: true })
                    }
                  />
                  <RxCross2
                    className="h-10 w-10 text-red-600 cursor-pointer hover:scale-110 duration-700"
                    onClick={() =>
                      friendRequestHandler({ idd: x._id, accept: false })
                    }
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-xl font-semibold text-center">
              No notifications
            </div>
          )}
        </Box>
      </div>
    </>
  );
};

export default Notifications;
