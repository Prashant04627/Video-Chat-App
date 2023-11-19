import React from "react";

import {Routes, Route} from "react-router-dom"
import LobbyScreen from "./screen/lobbyScreen";
import Room from "./screen/room";


function App() {
  return (
    <div className="App">
       
      <Routes>
        <Route path="/" element={<LobbyScreen></LobbyScreen>} ></Route>
        <Route path="/room/:id" element={<Room></Room>} ></Route>
      </Routes>
    </div>
  );
}

export default App;
