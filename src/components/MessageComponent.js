import moment from "moment";
import { fileFormat } from "../lib/Features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";
import CIcon from '@coreui/icons-react';
import { cilCheckDouble} from '@coreui/icons';
import seen from '../image/seen.png'
import { useSelector } from "react-redux";
import { useMyChatsQuery } from "../redux/api/api";

const MessageComponent = ({ message, user }) => {
  console.log('message',message)
  const { sender, content, attachments = [], createdAt } = message; 
  const sameSender = sender?._id === user?._id;
  // console.log(sender._id,user._id)
  const messageClass = sameSender ? "self-end" : "self-start";

  const timeAgo = moment(createdAt).fromNow();

  const { newMessagesAlert } = useSelector((state) => state.chat);

  const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");
  // console.log('user ka data in message compo = ',data)

  return (
    <motion.div
      initial={{ opacity: 0, x: "-100%" }}
      whileInView={{ opacity: 1, x: 0 }}
      className={`${messageClass} pr-8 pl-2 py-2 rounded-tl-xl rounded-bl-xl rounded-br-xl bg-gray-300 mt-2`}
    >
       <div className="w-full mx-2">
       <div className="flex items-center gap-2">
       {/* { !sameSender && <img src={sender?.avatar?.url} alt="img" className="w-5 h-5 object-cover rounded-full "/>} */}
       {!sameSender && <h2 className="capitalize font-bold">{sender.name}</h2>}
       </div>
      {sameSender && <h2 className="capitalize font-bold">You</h2>}
      {content && <div className="text-md tracking-tight leading-5">{content}</div>}
      {attachments.length > 0 &&
        attachments.map((attachement, index) => {
          const url = attachement.url;
          const file = fileFormat(url);
          return (
            <div key={index}>
              <a href={url} target="_blank" download className="bg-black">
                <RenderAttachment file={file} url={url} />
              </a>
            </div>
          );
        })}
       <div className="flex items-center justify-between w-full">
       <h2 className="text-xs text-gray-600">{timeAgo}</h2>
      {/* <CIcon icon={cilCheckDouble} /> */}
       { sameSender && <img src={seen } alt="Seen" width={16} height={16} className="text-gray-300"/>}
       </div>
       </div>
    </motion.div>
  );
};

export default MessageComponent;
