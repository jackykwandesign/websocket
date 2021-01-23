import React, { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket} from 'websocket'
import './App.css';



export interface WSClientMessage{
  event:'changeUserName' | 'sendMessage' 
  content:string,
  to?:string,
} 

export interface WSServerMessage{
  event:'receiveMessage' | 'newUserJoin' | 'serverBroadcast' | 'userRename'
  content:string,
  from?:string,
  to?:string,
} 
const client = new W3CWebSocket('ws://127.0.0.1:8123')


function App() {
  const [webSocketState, setWebSocketState] = useState<boolean>(false)
  const [username, setUserName] = useState<string>("New User")
  const [message, setMessage] = useState<string>("")
  const [chatLog, setChatLog] = useState<WSServerMessage[]>([])
  useEffect(()=>{
    client.onopen = () =>{
      console.log('WebSocket Client Connected');
      setWebSocketState(true)
    }
    client.onerror = () =>{
      console.log('WebSocket Client error');
      setWebSocketState(false)
    }
    client.onclose = () =>{
      console.log('WebSocket Client Disconnected');
      setWebSocketState(false)
    }
    client.onmessage = (message) =>{
      
      
      try {
        let msg = JSON.parse(message.data as string) as WSServerMessage
        // console.log("msg", msg);
        setChatLog([
          ...chatLog,
          msg
        ])
      } catch (error) {
        
      }
      
    }
  })
  const WSSetUserName = () =>{
    let msg:WSClientMessage = {
      event:'changeUserName',
      content:username
    }
    client.send(JSON.stringify(msg))
  }
  const WSSendMessage = (value:string) =>{
    let msg:WSClientMessage = {
      event:'sendMessage',
      content:value
    }
    client.send(JSON.stringify(msg))
  }
  return (
    <div className="App">
      <div>
        {
          webSocketState ? 'WebSocket Client Connected' : 'WebSocket Client Disconnected'
        }
      </div>
      <div>
        <label >UserName: </label>
        <input id="username" value={username} onChange={e=>setUserName(e.currentTarget.value)}/>
        <button onClick={WSSetUserName}>OK</button>
      </div>
      
      <div>Server Chat</div>
      <div>
        <textarea 
          value={message}
          onChange={e=>setMessage(e.currentTarget.value)}
        />
        <button
          onClick={()=>WSSendMessage(message)}
        >Send</button>
      </div>
      <div>
        {
          chatLog.map((chat, chatIndex)=>{
            if(chat.event === "serverBroadcast" || chat.event === "newUserJoin" || chat.event === "userRename"){
              return(
                <p key={chatIndex}>
                  <span>{`${"Server"}: ${chat.content}`}</span>
                </p>
              )
            }else if (chat.event === "receiveMessage"){
              return(
                <p key={chatIndex}>
                  <span>{`${chat.from}: ${chat.content}`}</span>
                </p>
              )
            }

          })
        }
      </div>
    </div>
  );
}

export default App;
