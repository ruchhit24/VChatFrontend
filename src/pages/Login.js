import React, { useState } from "react";
import { useFileHandler, useInputValidation} from '6pp'
import { emailValidator, usernameValidator } from "../utils/validator";
import { useStrongPassword } from "6pp"; 
import { server } from '../constants/config'
import axios from "axios";
import { userExists } from "../redux/reducers/auth";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom"; 
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import {Link} from 'react-router-dom'

 

const Login = () => {
  const [isSignedin, setIsSignedin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const[showAvatar,setShowAvatar] = useState(false)

  const dispatch = useDispatch();

  const username = useInputValidation("",usernameValidator ); 
  const email = useInputValidation("",emailValidator);
  const name = useInputValidation( "" );
  const bio = useInputValidation( "" );
  const password = useStrongPassword();
  const avatar = useFileHandler("single")

  const navigate = useNavigate() 


  const handleClick = () => {
    setIsSignedin(!isSignedin);
  };

 const handleLogin = async(e) => {
    e.preventDefault();

    setIsLoading(true);

    const config = {
      withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
     }
 
    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/login`,
        {
          username: username.value,
          password: password.value,
        },
        config,
      );
      dispatch(userExists(data.user));
      toast.success(data.message);
      window.location.href = "/";
    } catch (error) {
     toast.error(error?.response?.data?.message || "Something Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); 
    setIsLoading(true);
    const formData = new FormData();
    formData.append("avatar", avatar.file);
    formData.append("name", name.value);
    formData.append("bio", bio.value);
    formData.append("username", username.value);
    formData.append("email", email.value);
    formData.append("password", password.value);

    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/new`,
        formData,
        config
      );
     console.log(data)
      dispatch(userExists(data.user));
      toast.success(data.message);
      window.location.href = "/verify-email";
      if (!data.user.isVerified) {
        // Redirect to verify-email page only for the first registration
        window.location.href = "/verify-email";
      } else {
        // Redirect to home page for subsequent registrations
        window.location.href = "/";
      }

    } catch (error) {
     toast.error(error?.response?.data?.message || "Something Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const avatarHandler = (e)=>{
    e.preventDefault()
     setShowAvatar(true); 
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-[url('https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover ">
      <div className="w-[400px] border bg-gray-200 opacity-90 border-gray-400 shadow-2xl rounded-lg p-6">
        {isSignedin ? (
          <>
            <h2 className="text-center mt-8 text-3xl font-bold">L o G i N</h2>
            <form className="flex flex-col items-center pt-4 gap-4" onSubmit={handleLogin}>
              <input
                type="text"
                id="username"
                placeholder="Enter Your Username"
                className="border border-black p-2 w-full rounded-lg"
                value={username.value}
                onChange={username.changeHandler}
              />
              <input
                type="password"
                id="password"
                placeholder="Enter Your Password"
                className="border border-black p-2 w-full rounded-lg"
                value={password.value}
                onChange={password.changeHandler}
              />
              <div className="flex justify-center items-center mt-6">
              <>
      {isLoading ? ( // Render loader if isLoading is true
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // height: '100vh', // Set height to full viewport height
          }}
        >
          <CircularProgress color="success" size={40} /> {/* Set size */}
        </Box>
      ) : ( // Render button if isLoading is false
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-700 rounded-lg cursor-pointer font-semibold text-white"
          
        >
          LOGIN
        </button>
      )}
    </>
            </div>
            </form>
             
            <h3 className="text-center mt-4 text-sm font-semibold">OR</h3>
            <h2
              className="text-center mt-4 text-sm font-semibold text-cyan-700 hover:underline cursor-pointer"
              onClick={handleClick}
            >
              Sign Up Instead
            </h2>
            <div className="text-center mt-4">
              <Link to={'/forgot-password'} className="text-cyan-700 hover:underline cursor-pointer">
                Forgot Password?
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-center mt-8 text-3xl font-bold">
              R e G i S t E r
            </h2>
            {
                username.error && (
                    <div className="text-center bg-red-600 rounded-lg mt-4">
                        <h2 className="text-sm text-white p-3">{username.error}</h2>
                    </div>
                )
              }
              {
                password.error && (
                    <div className="text-center bg-red-600 rounded-lg mt-4">
                        <h2 className="text-sm text-white p-3">{password.error}</h2>
                    </div>
                )
              }
              {
                avatar.error && (
                    <div className="text-center bg-red-600 rounded-lg mt-4">
                        <h2 className="text-sm text-white p-3">{avatar.error}</h2>
                    </div>
                )
              }
              {
                email.error && (
                    <div className="text-center bg-red-600 rounded-lg mt-4">
                        <h2 className="text-sm text-white p-3">{email.error}</h2>
                    </div>
                )
              }
              
            <form className="flex flex-col items-center pt-4 gap-4" onSubmit={handleSignUp}>
              
              <input
                type="text"
                id="name"
                placeholder="Enter Your Full Name"
                className="border border-black p-2 w-full rounded-lg"
                value={name.value}
                onChange={name.changeHandler}
              />
              <input
                type="text"
                id="username"
                placeholder="Enter Your Username"
                className="border border-black p-2 w-full rounded-lg"
                value={username.value}
                onChange={username.changeHandler}
              />
              <input
                type="email"
                id="email"
                placeholder="Enter Your email"
                className="border border-black p-2 w-full rounded-lg"
                value={email.value}
                onChange={email.changeHandler}
              />
              
               <input
                type="text"
                id="bio"
                placeholder="Enter Your Bio"
                className="border border-black p-2 w-full rounded-lg"
                value={bio.value}
                onChange={bio.changeHandler}
              />
              <input
                type="password"
                id="password"
                placeholder="Enter Your Password"
                className="border border-black p-2 w-full rounded-lg"
                value={password.value}
                onChange={password.changeHandler}
              />
              <div className="flex items-center justify-center">
              <input type="file" accept="image/*" className="p-3 text-xs" onChange={avatar.changeHandler}  />
              <button className=" px-2 py-2 bg-gradient-to-r from-cyan-500 to-cyan-800 rounded-lg text-xs text-white" onClick={avatarHandler}>
                Upload Image
              </button>
              
            </div>
            <div className="flex items-center justify-center">
           {
            showAvatar && (
              <img src={avatar.preview} width={300} height={250} className="object-cover"/>
            )
           }
           

            </div>
            <div className="flex justify-center items-center mt-6">
            <>
      {isLoading ? ( // Render loader if isLoading is true
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            //height: '100vh', // Set height to full viewport height
          }}
        >
          <CircularProgress color="success" size={40} /> {/* Set size */}
        </Box>
      ) : ( // Render button if isLoading is false
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-700 rounded-lg cursor-pointer font-semibold text-white"
         
        >
          REGISTER
        </button>
      )}
    </>
            </div>
            </form>
             
            <h3 className="text-center mt-4 text-sm font-semibold">OR</h3>
            <h2
              className="text-center mt-4 text-sm font-semibold text-cyan-700 hover:underline cursor-pointer"
              onClick={handleClick}
            >
              Login Instead
            </h2>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
