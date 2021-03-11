import React, { useEffect, useRef } from "react"
import io from "socket.io-client"

const DashboardPage: React.FC = () => {
  const socketRef: any = useRef()

  useEffect(() => {
    socketRef.current = io("")
  }, [])

  const handleSubmit = () => {
    socketRef.current.emit("testing", "helooo")
  }

  return (
    <>
      <div> Dashboard Page...</div>
      <button onClick={handleSubmit}>Submit</button>
    </>
  )
}

export default DashboardPage
