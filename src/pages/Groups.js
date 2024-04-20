import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { IoIosRemoveCircle, IoMdArrowBack } from "react-icons/io";
import { LuPencilLine } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import GroupList from "../components/GroupList";

import { Skeleton } from "@mui/material";
import { toast } from "react-hot-toast";
import { IoIosAddCircle } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  useAddGroupMembersMutation,
  useAvailableFriendsQuery,
  useChatDetailsQuery,
  useDeleteChatMutation,
  useMyGroupsQuery,
  useRemoveGroupMemberMutation,
  useRenameGroupMutation,
} from "../redux/api/api";
import { setIsAddMember } from "../redux/reducers/misc";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Groups = () => {
  const chatId = useSearchParams()[0].get("group");
  // console.log('chat id = ',chatId);

  const navigate = useNavigate()

  // const [users, setUsers] = useState(SampleUser);
  const [groupName, setGroupName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isEditt, setIsEditt] = useState(false); 
  const [openDelete, setOpenDelete] = useState(false)
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  // const [members,setMembers] = useState(SampleUser)
  const [selectedMembers, setSelectedMembers] = useState([]);
  // console.log(selectedMembers)

  const dispatch = useDispatch();

  const { isAddMember } = useSelector((state) => state.misc);

  const [members, setMembers] = useState([]);

  const myGroups = useMyGroupsQuery("");

  // console.log('mygroups',myGroups)

  const groupDetails = useChatDetailsQuery(
    { chatId, populate: true },
    { skip: !chatId }
  );

  const [renameGroup] = useRenameGroupMutation();

  const renameGroupHandler = async (name, chatDetails) => {
    try {
      const res = await renameGroup({
        chatId,
        name: newGroupName,
      });
      console.log(res);

      if (res.data) {
        toast.success("Group name Updated !!");
      } else {
        toast.error(res?.error?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const updateGroupName = () => {
    setIsEditt(false);
    setGroupName(newGroupName);
    renameGroupHandler({
      chatId,
      name: newGroupName,
    });
  };

  const [removeMember] = useRemoveGroupMemberMutation();

  const removeMemberHandler = async (userId) => {
    try {
      const res = await removeMember({
        chatId,
        userId,
      });
      console.log(res);

      if (res.data) {
        toast.success("Group Member Removed !!");
      } else {
        toast.error(res?.error?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // removeMember("Removing Member...", { chatId, userId });

  const selectMemberHandler = (id) => { 
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((currElement) => currElement !== id)
        : [...prev, id]
    );
  };

  // useEffect(() => {
  //    if(chatId)
  //   {
  //     setGroupName(`Group Name = ${chatId}`);
  //     setNewGroupName(`Group Name = ${chatId}`);
  //   }

  //   return ()=>{
  //       setGroupName('')
  //       setNewGroupName('')
  //   }
  // }, [chatId]);
  useEffect(() => {
    const groupData = groupDetails.data;
    if (groupData) {
      setGroupName(groupData.chat.name);
      setNewGroupName(groupData.chat.name);
      setMembers(groupData.chat.members);
    }

    return () => {
      setGroupName("");
      setNewGroupName("");
      setMembers([]);
      setIsEditt(false);
    };
  }, [groupDetails.data]);

  const [addMembers] = useAddGroupMembersMutation();
  const { isLoading, data, isError, error } = useAvailableFriendsQuery(chatId);

  const addMemberSubmitHandler = async (selectedMembers, chatId) => {
    try {
      const res = await addMembers({ members: selectedMembers, chatId });
      console.log(res);

      if (res.data) {
        toast.success("Group Member Added!!");
      } else {
        toast.error(res?.error?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const openAddMemberHandler = () => {
    dispatch(setIsAddMember(true));
  };

  const closeAddMemberHandler = () => {
    dispatch(setIsAddMember(false));
  };

  const [deleteGroup] = useDeleteChatMutation();

  const deleteGroupHandler = async () => {
    try {
      const res = await deleteGroup(chatId);
      console.log(res);

      if (res.data) {
        toast.success("Group Deleted Successfully !!");
        handleCloseDelete();
        navigate("/groups");
      } else {
        toast.error(res?.error?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };
   
  return (
    <div className="grid grid-cols-12 w-full h-[100vh]">
      <div className="grid col-span-3 bg-gray-100 overflow-y-scroll">
        <GroupList myGroups={myGroups?.data?.groups} chatId={chatId} />
      </div>

      <div className="grid col-span-9 h-full relative">
        <div className="bg-zinc-800 w-12 h-12 absolute top-4 left-2 rounded-full flex items-center cursor-pointer hover:bg-gray-500 shadow-lg">
          <Link to={"/"}>
            <IoMdArrowBack className="w-10 h-10 text-white pl-1" />
          </Link>

          {chatId &&
            (isEditt ? (
              <div className="w-[50vw] absolute top-10 left-48 flex items-center justify-center gap-5">
                <input
                  type="text"
                  placeholder="Enter New Group Name"
                  className="border border-gray-400 p-3 rounded-lg text-3xl font-semibold tracking-wider leading-none "
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <TiTick
                  className="w-8 h-8 text-green-700"
                  onClick={updateGroupName}
                />
              </div>
            ) : (
              <div className="w-[50vw] absolute top-10 left-48 flex items-center justify-center gap-5">
                <h2 className="text-3xl font-semibold tracking-wider leading-none">
                  {groupName}
                </h2>
                <LuPencilLine
                  className="w-8 h-8"
                  onClick={() => setIsEditt(true)}
                />
              </div>
            ))}

          {!groupName && (
            <div className="w-[50vw] absolute top-10 left-48 text-center">
              <h1 className="text-3xl font-semibold tracking-wider leading-none">
                No Groups Selected
              </h1>
            </div>
          )}

          {chatId && (
            <div className="w-full min-h-screen relative flex items-center justify-center">
              <div className="w-[30vw] absolute top-[65%] left-[4050%] h-[60vh] p-3">
                <h1 className="text-center text-xl font-semibold">Members</h1>
                <div className="w-full h-[80%] mt-4 overflow-y-scroll">
                  {members &&
                    members.map((user,index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center mt-4 p-3 border-b-[1px] border-gray-300"
                      >
                        <div className="flex gap-5 items-center text-lg">
                          <img
                            src={user.avatar}
                            alt="jf"
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <h1>{user.name}</h1>
                        </div>
                        <IoIosRemoveCircle
                          className="text-red-600 w-7 h-7"
                          onClick={() => removeMemberHandler(user._id)}
                        />
                      </div>
                    ))}
                </div>

                <div className="flex justify-between p-3">
                  <button
                    className="px-4 py-2 border-gray-400 border-[1px] bg-cyan-700 text-white font-semibold rounded-lg cursor-pointer"
                    onClick={openAddMemberHandler}
                  >
                    <span className="text-white font-bold">+</span> Add Members
                  </button>
                  <button
                    className="flex gap-2 items-center px-4 py-2 border-red-400 border-[1px] bg-white text-red-600 font-semibold rounded-lg cursor-pointer"
                    onClick={handleOpenDelete}
                  >
                    <span className="text-red-700">
                      <MdDelete />
                    </span>
                    Delete Group
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAddMember && (
            <div>
              <Modal
                open={isAddMember}
                onClose={closeAddMemberHandler}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                    style={{ textAlign: "center" }}
                  >
                    Add Members
                  </Typography>
                  <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    {isLoading ? (
                      <Skeleton />
                    ) : data?.friends?.length > 0 ? (
                      data?.friends?.map((user,index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center mt-4 p-3 border-b-[1px] border-gray-300"
                        >
                          <div className="flex gap-5 items-center text-lg">
                            <img
                              src={user.avatar}
                              alt="jf"
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <h1>{user.name}</h1>
                          </div>
                          <div onClick={() => selectMemberHandler(user._id)}>
                            {selectedMembers.includes(user._id) ? (
                              <IoIosRemoveCircle className="text-red-700 w-7 h-7" />
                            ) : (
                              <IoIosAddCircle className="text-cyan-500 w-7 h-7" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <Typography textAlign={"center"}>No Friends</Typography>
                    )}
                  </Typography>
                  <div className="flex justify-between p-3">
                    <button className="px-4 py-2 border-red-400 border-[1px] bg-white text-red-600 font-semibold rounded-lg cursor-pointer" onClick={closeAddMemberHandler}>
                      Cancel
                    </button>
                    <button
                      className="flex gap-2 items-center px-4 py-2 border-gray-400 border-[1px] bg-cyan-700 text-white font-semibold rounded-lg cursor-pointer"
                      onClick={() =>
                        addMemberSubmitHandler(selectedMembers, chatId)
                      }
                    >
                      Submit Changes
                    </button>
                  </div>
                </Box>
              </Modal>
            </div>
          )}
          {openDelete && (
            <div>
              <Modal
                open={openDelete}
                onClose={handleCloseDelete}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Are u sure you want to delete this group ?
                  </Typography>
                  <div className="flex justify-between p-3">
                    <button className="px-4 py-2 border-gray-400 border-[1px] bg-cyan-700 text-white font-semibold rounded-lg cursor-pointer" onClick={handleCloseDelete}>
                      Cancel
                    </button>
                    <button className="flex gap-2 items-center px-4 py-2 border-red-400 border-[1px] bg-white text-red-600 font-semibold rounded-lg cursor-pointer" onClick={deleteGroupHandler}>
                      <span className="text-red-600">
                        <MdDelete />
                      </span>
                      Delete Group
                    </button>
                  </div>
                </Box>
              </Modal>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
