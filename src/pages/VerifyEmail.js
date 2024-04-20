// VerifyEmail.js

import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { server } from "../constants/config";
import { toast } from "react-hot-toast";
import { Redirect } from 'react-router-dom';
import { PiSignOutBold } from "react-icons/pi";
import { userNotExists } from "../redux/reducers/auth";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const userId = useSelector((state) => state.auth.user?._id);
//   const isVerified = useSelector((state) => state.auth.user?.isVerified);
//   if (isVerified) {
//     return window.location.href = "/";
//   }

const dispatch = useDispatch();

  const handleVerify = async () => {
    try {
      const response = await axios.post(`${server}/api/v1/user/verify-email`,{ userId, otp });
      if (response.data.success) {
        // Redirect to home page upon successful verification
        toast.success(response.data.message);
        window.location.href = "/";
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      alert("An error occurred while verifying email.");
    }
  };

  const logoutHandler = async () => {
    try {
      const { data } = await axios.get(`${server}/api/v1/user/logout`, {
        withCredentials: true,
      });
      dispatch(userNotExists());
      toast.success(data.message);
      window.location.href = "/login";
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="relative">
         <div className="bg-gray-100 p-4 absolute">
    <PiSignOutBold
          className="text-zinc-800 w-10 h-10 cursor-pointer hover:text-gray-500"
          onClick={logoutHandler}
        />
    </div>
    <div className="flex justify-center items-center h-screen bg-gray-100">
    
    <div className="bg-white p-8 rounded-lg shadow-md w-[40vw]">
      <h2 className="text-3xl font-semibold mb-4">Verify Email</h2>
      <h3 className="text-md font-semibold mb-4">Please Check Your Registered Email Address !! </h3>
      <input
        type="text"
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
       <div className="flex items-center justify-center">
       <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
        onClick={handleVerify}
      >
        Verify
      </button>
       </div>
    </div>
  </div>
    </div>
     
  )
};

export default VerifyEmail;
