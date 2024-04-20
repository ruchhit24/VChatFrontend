import React, { useState } from "react";
import { IoIosRemoveCircle, IoMdAdd } from "react-icons/io";
import Modal from "@mui/material/Modal";
import { Box, Tooltip } from "@mui/material";
import { SampleUser } from "../utils/SampleUser";
import { IoIosAddCircle } from "react-icons/io";
import { useInputValidation } from "6pp";
import { useDispatch } from "react-redux";
import { setIsNewGroup } from "../redux/reducers/misc";
import {
  useAvailableFriendsQuery,
  useNewGroupMutation,
} from "../redux/api/api";
import { toast } from "react-hot-toast";
import {
  Add as AddIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  p: 4,
};

const NewGroup = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  // const [users, setUsers] = useState(SampleUser);
  // const searchValue = useInputValidation("");
  // console.log(users)

  const groupName = useInputValidation("");

  const [selectedMembers, setSelectedMembers] = useState([]);

  const { isError, isLoading, error, data } = useAvailableFriendsQuery();

  const [newGroup] = useNewGroupMutation();

  const addNewGroupHandler = async (name, members) => {
    try {
      const res = await newGroup({
        name: groupName.value,
        members: selectedMembers,
      });
      console.log(res);

      if (res.data) {
        toast.success("New Group Created");
        groupName.value = "";
        setSelectedMembers([]);
        handleClose(); // Close the modal
      } else {
        toast.error(res?.error?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const newGroupCreationHandler = () => {
    if (!groupName.value) return toast.error("Group name is required");

    if (selectedMembers.length < 2)
      return toast.error("Please Select Atleast 3 Members");
    addNewGroupHandler({ name: groupName.value, members: selectedMembers });
  };

  const selectMemberHandler = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((currElement) => currElement !== id)
        : [...prev, id]
    );
  };
  return (
    <>
     <Tooltip title="Create New Group" arrow>
    <AddIcon fontSize='large' className='text-white w-6 h-6 cursor-pointer hover:text-gray-500' onClick={handleOpen} />
    </Tooltip>
       

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h1 className="text-3xl font-semibold text-center mb-3">New Group</h1>

          <input
            type="text"
            value={groupName.value}
            placeholder="Group Name"
            onChange={groupName.changeHandler}
            className="border border-gray-500 w-full p-2 text-black rounded-lg"
          />
          <h1 className="pt-2 text-lg font-semibold">Members</h1>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            data?.friends?.map((user) => (
              <div
                key={user._id}
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
          )}
          <div className="flex justify-between p-4">
            <button
              className="px-4 py-2 text-red-600 hover:text-white border-2 border-red-600 hover:border-white rounded-md text-base font-semibold cursor-pointer hover:bg-red-600"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-cyan-500 text-white rounded-md text-base font-semibold cursor-pointer"
              onClick={newGroupCreationHandler}
            >
              Create
            </button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default NewGroup;
