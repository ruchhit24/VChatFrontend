import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng"; // Import Agora Web SDK
import { Grid } from "@mui/material";
import { channelName, useClient } from "../constants/settings";

export default function Video(props) {
  const { users, tracks } = props;
  const [gridSpacing, setGridSpacing] = useState(12);

  useEffect(() => {
    setGridSpacing(Math.max(Math.floor(12 / (users.length + 1)), 4));
  }, [users, tracks]);

  useEffect(() => {
    // Initialize Agora client
    // const agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

    // Join a channel (replace with your channel name)
    useClient.join(channelName, null, null);

    // Create a local video track
    const videoTrack = AgoraRTC.createCameraVideoTrack();

    // Publish the local video track
    useClient.publish([videoTrack]);

    return () => {
      // Clean up when component unmounts
      useClient.leave();
      videoTrack.stop();
    };
  }, []);

  return (
    <Grid container style={{ height: "100%" }}>
      <Grid item xs={gridSpacing}>
        <video ref={(node) => node && tracks[1].play(node)} />
      </Grid>
      {users.length > 0 &&
        users.map((user) => {
          if (user.videoTrack) {
            return (
              <Grid item xs={gridSpacing} key={user.uid}>
                <video ref={(node) => node && user.videoTrack.play(node)} />
              </Grid>
            );
          } else return null;
        })}
    </Grid>
  );
}
