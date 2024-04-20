import moment from "moment";
import { fileFormat } from "../lib/Features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";

const MessageComponent = ({ message, user }) => {
  // console.log('message',message)
  const { sender, content, attachments = [], createdAt } = message;
  const sameSender = sender?._id === user?._id;
  // console.log(sender._id,user._id)
  const messageClass = sameSender ? "self-end" : "self-start";

  const timeAgo = moment(createdAt).fromNow();

  return (
    <motion.div
      initial={{ opacity: 0, x: "-100%" }}
      whileInView={{ opacity: 1, x: 0 }}
      className={`${messageClass} pr-8 pl-2 py-2 rounded-tl-xl rounded-bl-xl rounded-br-xl bg-gray-300 mt-2`}
    >
      {!sameSender && <h2 className="capitalize font-bold">{sender.name}</h2>}
      {sameSender && <h2 className="capitalize font-bold">You</h2>}
      {content && <div>{content}</div>}
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
      <h2 className="text-xs text-gray-600">{timeAgo}</h2>
    </motion.div>
  );
};

export default MessageComponent;
