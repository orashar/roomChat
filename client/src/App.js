import React, { useState, useRef, useEffect } from 'react'
import Form from './components/Form'
import Chat from './components/Chat'
import io from 'socket.io-client'
import immer, { current } from 'immer'
import './App.css';


const initialMessageState = {
  general: [],
  random: [],
  jokes: [],
  javascript: []
}

function App() {
  const [ username, setUsername ] = useState("")
  const [ connected, setConnected ] = useState(false)
  const [ currentChat, setCurrentChat ] = useState({isChannel: true, chatName: "general", receiverId: ""})
  const [ connectedRooms, setconnectedRooms ] = useState(["general"])
  const [ allUsers, setAllUsers ] = useState([])
  const [ messages, setMessages ] = useState(initialMessageState)
  const [ message, setMessage ] = useState("")
  const socketRef = useRef()

  useEffect(() => {
    setMessage("")
  }, [messages])

  const handleMessageChange = (e) => {
    setMessage(e.target.value)
  }

  const sendMessage = () => {
    const payload = {
      content : message,
      to: currentChat.isChannel ? currentChat.chatName : currentChat.receiverId,
      sender: username,
      chatName: currentChat.chatName,
      isChannel: currentChat.isChannel
    }
    socketRef.current.emit("send message", payload)
    const newMessages = immer(messages, draft => {
      draft[currentChat.chatName].push({
        sender: username,
        content: message
      })
    })
    setMessages(newMessages)
  }

  const roomJoinCallback = (incomingMessages, room) => {
    const newMessages = immer(messages, draft => {
      draft[room] = incomingMessages
    })
    setMessages(newMessages)
  }

  const joinRoom = (room) => {
    const newConnectedRooms = immer(connectedRooms, draft => {
      draft.push(room)
    })
    socketRef.current.emit("join room", room, (messages) => roomJoinCallback(messages, room))
    setconnectedRooms(newConnectedRooms)
  }

  const toggleChat = (currentChat) => {
    if(!messages[currentChat.chatName]){
      const newMessages = immer(messages, draft => {
        draft[currentChat.chatName] = ""
      })
      setMessages(newMessages)
    }
    setCurrentChat(currentChat)
  }

  const handleChange = (e) => {
    setUsername(e.target.value)
  }

  const connect = () => {
    setConnected(true)
    socketRef.current = io.connect("/")
    socketRef.current.emit("join server", username)
    socketRef.current.emit("join room", "general", (messages) => roomJoinCallback(messages, "general"))
    socketRef.current.on("new user", allUsers => {
      setAllUsers(allUsers)
    })
    socketRef.current.on("new message", ({ content, sender, chatName }) => {
      setMessages(messages => {
        const newMessages = immer(messages, draft => {
          if(draft[chatName]) draft[chatName].push({content, sender})
          else draft[chatName] = [{ content, sender}]
        })
        return newMessages
      }) 
    })
  }

  let body
  if(connected){
    body = (
      <Chat
        message={message}
        handleMessageChange={handleMessageChange}
        sendMessage={sendMessage}
        yourId={socketRef.current ? socketRef.current.id : ""}
        allUsers={allUsers}
        joinRoom={joinRoom}
        connectedRooms={connectedRooms}
        currentChat={currentChat}
        toggleChat={toggleChat}
        messages={messages[currentChat.chatName]}
      />
    )
  } else{
    body = <Form username={username} onChange={handleChange} connect={connect}/>
  }

  return (
    <div className="App">
      {body}
    </div>
  );
}

export default App;
