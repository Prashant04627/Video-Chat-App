import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/socketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

function Room() {
  const socket = useSocket();

  const [remoteJoinId, setRemoteJoinId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoin = useCallback(({ email, id }) => {
    console.log(`this user ${email} joined ${id}`);
    console.log(id);
    setRemoteJoinId(`${id}`);
  }, []);

  const handleUserCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteJoinId, offer });
    console.log(remoteJoinId);
    setMyStream(stream);
  }, [remoteJoinId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteJoinId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      console.log(`incomming call`, from, offer);
      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, answer });
    },
    [socket]
  );

  const handleNego = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("reconnect:needed", { to: remoteJoinId, offer });
  }, [remoteJoinId, socket]);

  const handleNegoDone = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNego);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNego);
    };
  }, [handleNego]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handleRemoteCall = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleAcceptCall = useCallback(
    ({ from, answer }) => {
      peer.setLocalDescription(answer);
      console.log("accept", from, answer);
      handleRemoteCall();
    },
    [handleRemoteCall]
  );

  const handleNegoIncoming = useCallback(
    async ({ from, offer }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("nego:done", { to: from, answer });
    },
    [socket]
  );

  useEffect(() => {
    socket.on("user:room", handleUserJoin);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleAcceptCall);
    socket.on("reconnect:needed", handleNegoIncoming);
    socket.on("nego:done", handleNegoDone);
    return () => {
      socket.off("user:room", handleUserJoin);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleAcceptCall);
      socket.off("reconnect:needed", handleNegoIncoming);
      socket.off("nego:done", handleNegoDone);
    };
  }, [
    socket,
    handleUserJoin,
    handleIncommingCall,
    handleAcceptCall,
    handleNegoIncoming,
    handleNegoDone,
  ]);

  return (
    <div>
      <h1>Room</h1>
      <h5>{remoteJoinId ? "Connected" : "No one connected"}</h5>
      {remoteJoinId && <button onClick={handleUserCall}> Call</button>}
      {myStream && <button onClick={handleRemoteCall}>Send Stream</button>}
      {myStream && (
        <>
          <h3> My Stream</h3>
          <ReactPlayer
            url={myStream}
            width="250px"
            height="50"
            playing
            muted
          ></ReactPlayer>
        </>
      )}
      {remoteStream && (
        <>
          <h3>Remote Stream</h3>
          <ReactPlayer
            url={remoteStream}
            width="250px"
            height="50"
            playing
            muted
          ></ReactPlayer>
        </>
      )}
    </div>
  );
}

export default Room;
