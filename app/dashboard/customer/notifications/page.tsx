"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  FiSend, 
  FiPaperclip, 
  FiImage,
  FiSmile,
  FiMoreVertical,
  FiSearch,
  FiPhone,
  FiVideo,
  FiInfo,
  FiCheckCircle
} from "react-icons/fi";

type Chat = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
};

type Message = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
};

const CHATS: Chat[] = [
  {
    id: "1",
    name: "Sophie Service Station",
    avatar: "/garages/garage01.jpg",
    lastMessage: "Hi! I need more information.",
    time: "2m",
    unread: 3,
    online: true
  },
  {
    id: "2",
    name: "ABC Service Station",
    avatar: "/garages/garage02.jpg",
    lastMessage: "Awesome work, can you...",
    time: "1h",
    online: true
  },
  {
    id: "3",
    name: "New Service Station",
    avatar: "/garages/garage03.jpg",
    lastMessage: "About the I can...",
    time: "3h",
    online: false
  },
  {
    id: "4",
    name: "NO 1 Car Repair",
    avatar: "/garages/garage01.jpg",
    lastMessage: "Have a great afternoon...",
    time: "1d",
    online: false
  },
  {
    id: "5",
    name: "Auto Motors",
    avatar: "/garages/garage02.jpg",
    lastMessage: "Hi! I need more information.",
    time: "2d",
    online: true
  },
  {
    id: "6",
    name: "B Service Station",
    avatar: "/garages/garage03.jpg",
    lastMessage: "Hi! I need more information.",
    time: "3d",
    online: false
  },
  {
    id: "7",
    name: "Car Wash",
    avatar: "/garages/garage01.jpg",
    lastMessage: "Awesome work, can you...",
    time: "1w",
    online: false
  },
  {
    id: "8",
    name: "Green Car",
    avatar: "/garages/garage02.jpg",
    lastMessage: "About the I can...",
    time: "2w",
    online: false
  }
];

const MESSAGES: Message[] = [
  { id: "1", sender: "them", text: "Hi! I need more information about your service request.", time: "10:30 AM", status: "read" },
  { id: "2", sender: "me", text: "Hello! I need a full service for my Toyota Camry.", time: "10:32 AM", status: "read" },
  { id: "3", sender: "them", text: "Sure! When would you like to schedule the appointment?", time: "10:33 AM", status: "read" },
  { id: "4", sender: "me", text: "How about this Friday at 2 PM?", time: "10:35 AM", status: "read" },
  { id: "5", sender: "them", text: "That works perfectly! We'll see you then.", time: "10:36 AM", status: "delivered" }
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string>("1");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedChatData = CHATS.find(c => c.id === selectedChat);
  const filteredChats = CHATS.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending:", message);
      setMessage("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-sm text-slate-500 mt-1">Chat with your service providers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            {CHATS.filter(c => c.online).length} Online
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200" style={{ height: '650px' }}>
        <div className="flex h-full">
          {/* Chat List Sidebar */}
          <div className="w-96 border-r border-slate-200 flex flex-col bg-gradient-to-b from-slate-50 to-white">
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat, index) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-4 flex gap-3 transition-all relative group ${
                    selectedChat === chat.id 
                      ? 'bg-orange-50 border-l-4 border-l-orange-500' 
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  } ${index !== 0 ? 'border-t border-slate-100' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <Image
                      src={chat.avatar}
                      alt={chat.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                    {chat.unread && chat.unread > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-bold text-sm truncate ${
                        chat.unread ? 'text-slate-900' : 'text-slate-700'
                      }`}>
                        {chat.name}
                      </h3>
                      <span className={`text-xs flex-shrink-0 ml-2 ${
                        chat.unread ? 'text-orange-600 font-semibold' : 'text-slate-400'
                      }`}>
                        {chat.time}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${
                      chat.unread ? 'text-slate-700 font-medium' : 'text-slate-500'
                    }`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedChatData ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={selectedChatData.avatar}
                        alt={selectedChatData.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      {selectedChatData.online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{selectedChatData.name}</h3>
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {selectedChatData.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors group">
                      <FiPhone className="w-5 h-5 text-slate-600 group-hover:text-orange-500 transition-colors" />
                    </button>
                    <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors group">
                      <FiVideo className="w-5 h-5 text-slate-600 group-hover:text-orange-500 transition-colors" />
                    </button>
                    <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors group">
                      <FiInfo className="w-5 h-5 text-slate-600 group-hover:text-orange-500 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50/50 to-white">
                  {/* Date Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="text-xs text-slate-500 font-medium bg-white px-3 py-1 rounded-full border border-slate-200">
                      Today
                    </span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                  </div>

                  {MESSAGES.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'them' && (
                        <Image
                          src={selectedChatData.avatar}
                          alt="Avatar"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                        />
                      )}
                      <div className={`max-w-[65%] ${msg.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            msg.sender === 'me'
                              ? 'bg-orange-500 text-white rounded-br-md'
                              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${
                          msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                          <span className="text-xs text-slate-400">{msg.time}</span>
                          {msg.sender === 'me' && msg.status === 'read' && (
                            <FiCheckCircle className="w-3 h-3 text-blue-500" />
                          )}
                          {msg.sender === 'me' && msg.status === 'delivered' && (
                            <FiCheckCircle className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-200 bg-white">
                  <div className="flex items-end gap-2">
                    <div className="flex gap-1">
                      <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors group">
                        <FiPaperclip className="w-5 h-5 text-slate-500 group-hover:text-orange-500 transition-colors" />
                      </button>
                      <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors group">
                        <FiImage className="w-5 h-5 text-slate-500 group-hover:text-orange-500 transition-colors" />
                      </button>
                    </div>
                    
                    <div className="flex-1 relative">
                      <textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        rows={1}
                        className="w-full px-4 py-3 pr-12 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all resize-none"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                      />
                      <button className="absolute right-2 bottom-2 p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                        <FiSmile className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className={`p-3 rounded-xl transition-all shadow-md ${
                        message.trim()
                          ? 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg hover:scale-105'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 ml-1">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
                <div className="text-center max-w-sm px-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSearch className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Select a conversation</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Choose a chat from the list to start messaging with your service provider
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}