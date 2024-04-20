import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const GroupItem = ({ group, chatId , index }) => {
  const { name, avatar, _id } = group;
 
  return (
    <Link
      to={`?group=${_id}`}
      onClick={(e) => {
        if (chatId === _id) e.preventDefault();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: "-100%" }}
        whileInView={{ opacity: 1, y: 0 }}  
        className="p-3 border-b-[1px] border-gray-400 flex items-center justify-between gap-3 hover:bg-gray-300"
      >
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt="dj"
            className="w-12 h-12 object-cover rounded-full "
          />
          <div className="flex justify-between items-center">
            <h2>{name}</h2>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default GroupItem;
