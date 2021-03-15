import React, { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import Peer from "simple-peer"

import { StyledVideo, Container } from "./styles"

const Video = (props: any) => {
  const ref: any = useRef()

  useEffect(() => {
    props.peer.on("stream", (stream: any) => {
      ref.current.srcObject = stream
    })
  }, [])

  return <StyledVideo playsInline autoPlay ref={ref} />
}

const MainPage = (props: any): any => {
  const [peers, setPeers] = useState([])
  const socketRef: any = useRef()
  const userVideo: any = useRef()
  const peersRef: any = useRef([])
  const roomID = props.match.params.roomID

  useEffect(() => {
    socketRef.current = io.connect("/")

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        userVideo.current.srcObject = stream
        socketRef.current.emit("join room", roomID)

        socketRef.current.on("all users", (users: any) => {
          console.log("users", users)
          const peers: any = []
          users.forEach((user: any) => {
            const peer = createPeer(user.id, socketRef.current.id, stream)
            peersRef.current.push({
              peerID: user.id,
              peer,
            })
            console.log("peers", peers)
            peers.push(peer)
          })
          setPeers(peers)
        })

        socketRef.current.on("user joined", (payload: any) => {
          const peer = addPeer(payload.signal, payload.callerID, stream)
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          })
          setPeers((users: any): any => [...users, peer])
        })

        //
        socketRef.current.on("receiving returned signal", (payload: any) => {
          const item = peersRef.current.find(
            (p: any) => p.peerID === payload.id
          )
          item.peer.signal(payload.signal)
        })
      })

    socketRef.current.on("callerends", () => {
      setPeers([])
      peersRef.current = []
      socketRef.current.emit("join room")
    })
  }, [])

  function createPeer(userToSignal: any, callerID: any, stream: any) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    })

    peer.on("signal", (signal: any) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      })
    })

    return peer
  }

  function nextUser() {
    if (peersRef.current.length) {
      setPeers([])
      peersRef.current = []
      socketRef.current.emit("endcall", peersRef.current[0].peerID)
      socketRef.current.emit("join room", roomID)
    }
  }

  function addPeer(incomingSignal: any, callerID: any, stream: any) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })

    peer.on("signal", (signal: any) => {
      socketRef.current.emit("returning signal", { signal, callerID })
    })

    peer.signal(incomingSignal)

    return peer
  }

  return (
    <Container>
      <StyledVideo muted ref={userVideo} autoPlay playsInline />
      {peers.map((peer, index) => {
        return <Video key={index} peer={peer} />
      })}
      <>
        <button onClick={nextUser}>Next</button>
      </>
    </Container>
  )
}

export default MainPage
