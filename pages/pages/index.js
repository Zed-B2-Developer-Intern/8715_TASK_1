// pages/index.js
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Layout, Input, Button, List, Avatar } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
let socket;

export default function Home() {
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch("/api/socket");
    socket = io();

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, { text: msg, sender: "other" }]);
    });

    socket.on("typing", (status) => {
      setTypingStatus(status ? "Someone is typing..." : "");
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = () => {
    if (!username || !room) return;
    socket.emit("joinRoom", { username, room });
    setJoined(true);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "me" }]);
    socket.emit("sendMessage", { room, message: input });
    socket.emit("typing", { room, status: false });
    setInput("");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit("typing", { room, status: e.target.value.length > 0 });
  };

  if (!joined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow p-6 w-96 space-y-4">
          <h2 className="text-xl font-bold text-center">Join a Chat Room</h2>
          <Input
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <Button type="primary" block onClick={handleJoin}>
            Join Room
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Layout className="h-screen">
      <Sider width={250} className="bg-white p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <List
          dataSource={[{ name: "Esha" }, { name: "Michu" }]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{item.name[0]}</Avatar>}
                title={item.name}
              />
            </List.Item>
          )}
        />
      </Sider>

      <Layout>
        <Header className="bg-blue-600 text-white px-6 py-4 text-xl">
          Room: {room}
        </Header>
        <Content className="p-4 bg-gray-100 flex flex-col">
          <div className="flex-1 overflow-auto space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender === "me"
                    ? "bg-blue-500 text-white self-end"
                    : "bg-white shadow self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {typingStatus && (
              <div className="text-sm italic text-gray-500">
                {typingStatus}
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="mt-2 flex gap-2">
            <Input
              value={input}
              onChange={handleTyping}
              onPressEnter={handleSend}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
            >
              Send
            </Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

