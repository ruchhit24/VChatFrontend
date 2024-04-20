import React from 'react'
import { FaFile } from 'react-icons/fa6';

const RenderAttachment = ({file,url}) => {
  
     switch(file){
        case 'video': return <video src={url} preload='none' width={'200px'} controls/>
                      
        case 'image': return <img src={url} width={'200px'} height={'150px'} className='objct-cover'/>
                         
        case 'audio': return <audio src={url} preload='none' controls/> 
                        
        default : return <FaFile/>                                      
     }
     return (
    <div>RenderAttachment</div>
  )
}

export default RenderAttachment