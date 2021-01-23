const webSocketsServerPort = 8123;
// const webSocketServer = require('websocket').server;
// const http = require('http');
import websocket, { request } from 'websocket'
import http from 'http'

//ws & http server config
const webSocketServer = websocket.server
const port = 8123
const httpServer = http.createServer()
httpServer.listen(port)
const wsServer = new webSocketServer({
  httpServer:httpServer
})

export interface User{
  id:string,
  connection:websocket.connection,
  name:string
  status:string
}
export interface WSClientMessage{
  event:'changeUserName' | 'sendMessage' 
  content:string,
  to?:string,
} 

export interface WSServerMessage{
  event:'receiveMessage' | 'newUserJoin' | 'serverBroadcast' | 'userRename' | 'userDisconnected'
  content:string,
  from?:string,
  to?:string,
} 

const clientList = new Map<string, User>();


// // This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

wsServer.on('request', (request)=>{
  console.log((new Date()) + ' Recieved a new request from origin ' + request.origin + '.');
  const connection = request.accept(undefined, request.origin);

  // accept connection here , can verify token / cookie for security
})

wsServer.on('connect', (conn:websocket.connection)=>{

  const userID = getUniqueID()
  let newUser = {
    id:userID,
    name:"New User",
    connection:conn,
    status:"online"
  }
  clientList.set(userID, newUser)
  let newUserMessage:WSServerMessage = {
    event:'newUserJoin',
    content:`user "#${userID}" join the connection`
  }
  wsServer.broadcast(JSON.stringify(newUserMessage))

  conn.on('message', (msg)=>{
    let user = clientList.get(userID)
    let message = JSON.parse(msg.utf8Data as string) as WSClientMessage
    if(user && message){
      switch(message.event){

        case "changeUserName":
          user.name = message.content
          clientList.set(userID, newUser)
          let userRenameMessage:WSServerMessage = {
            event:'userRename',
            content:`user "#${userID}" rename to ${user.name}`
          }
          wsServer.broadcast(JSON.stringify(userRenameMessage))
          break
  
        case "sendMessage":
          let newMessage:WSServerMessage = {
            event:"receiveMessage",
            content:message.content,
            from:user.name,
            to:"all"
          }
          wsServer.broadcast(JSON.stringify(newMessage))
          break
      }
    }

    // console.log(msg.utf8Data)
  })

  conn.on('close',(code, desc)=>{
    console.log(code,desc)
    let user = clientList.get(userID)
    let newMessage:WSServerMessage = {
      event:"userDisconnected",
      content:`User "${user?.name}" disconnected.`,
    }
    wsServer.broadcast(JSON.stringify(newMessage))
  })
})

wsServer.on('close',()=>{
  console.log("WS server close.")
})

// wsServer.on('request', function(request) {
//   var userID = getUniqueID();
//   console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
//   // You can rewrite this part of the code to accept only the requests from allowed origin
//   const connection = request.accept(null, request.origin);
//   clients[userID] = connection;
//   console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients))
// });
