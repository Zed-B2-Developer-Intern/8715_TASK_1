// pages/index.js
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { Input, Button, Layout, List, Avatar } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

let socket;

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingStatus, setTypingStatus] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch("/api/socket");
    socket = io();

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, { text: msg, sender: "other" }]);
    });

    socket.on("typing", (status) => {
      setTypingStatus(status ? "Michu is typing..." : "");
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "me" }]);
    socket.emit("sendMessage", input);
    socket.emit("typing", false);
    setInput("");
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit("typing", e.target.value.length > 0);
  };

  return (
    <Layout className="h-screen">
      <Sider width={250} className="bg-white p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <List
          itemLayout="horizontal"
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
        <Header className="bg-blue-600 text-white text-xl px-6 py-4">
          Chat Room
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
              onPressEnter={sendMessage}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
            >
              Send
            </Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
