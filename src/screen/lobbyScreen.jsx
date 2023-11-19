import React, { useState,useCallback, useContext, useEffect } from "react";
import { useSocket } from "../context/socketProvider";
import {useNavigate} from "react-router-dom"


function LobbyScreen() {
    const socket = useSocket();
    const navigate = useNavigate();
const [email,setEmail] = useState("");
const [room, setRoom] = useState('');
const handleClick = useCallback((e) => {
    
    e.preventDefault();
     socket.emit("room:join", {email,room} )
   
} , [email,room,socket])

const handleRoomJoin = useCallback((data) => {
    const {email,room} = data;
  navigate(`/room/${room}`)
},[])

useEffect(() => {
    socket.on('room:join', handleRoomJoin);
    return () =>{ socket.off('room:join' , handleRoomJoin)}
},[socket , handleRoomJoin])

    return (
     <div>
       <h1> 
        Lobby
       </h1>
       <form onSubmit={handleClick}>
        <label htmlFor="email"> Email </label>
        <input type="email" id="email" value={email} onChange={e =>{
            setEmail(e.target.value)
        }} ></input>
        <br/>
        <label htmlFor="room"> Room </label>
        <input type="text" id="room" value={room} onChange={e => {
            setRoom(e.target.value)
        }} ></input>
        <button> Join </button>
       </form>

     </div>
    )
}
 
export default LobbyScreen;