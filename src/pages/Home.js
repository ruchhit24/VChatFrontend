import React from 'react'
import AppLayout from '../components/AppLayout'

const Home = () => {
  return (
    <AppLayout> {/* No need for wrapping () */}
     <div className='p-8 w-full h-[91vh] bg-cover bg-center' style={{backgroundImage: 'url("https://static.vecteezy.com/system/resources/previews/003/596/357/non_2x/video-chatting-concept-in-modern-flat-design-man-and-woman-communicate-by-video-call-and-correspond-in-messenger-on-mobile-phone-online-communication-with-friends-or-family-illustration-vector.jpg")'}}>

      
        <h1 className='text-center font-bold text-xl'>S E L E C T _ A _ F R I E N D _ T O _ C H A T </h1>
       
     </div>
       
    </AppLayout>
  )
}

export default Home;
