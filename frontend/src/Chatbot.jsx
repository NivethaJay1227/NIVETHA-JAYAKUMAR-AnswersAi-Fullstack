import React, { useState } from 'react';

function Chatbot() {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [tokenUsage, setTokenUsage] = useState({ inputTokens: 0, outputTokens: 0, availableTokens: 1024 });

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message) return;

    setIsTyping(true);

    setChats((prevChats) => [...prevChats, { role: 'user', content: message }]);
    setMessage('');

    try {
      // Retrieve the token from localStorage or other secure storage
      const token = localStorage.getItem('token');
      
      // Make API call to send user message to backend
      const response = await fetch('http://localhost:8080/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      

      const responseText = data.text;

      // Add bot response to chats
      setChats((prevChats) => [...prevChats, { role: 'bot', content: responseText }]);

      // Update token usage
      setTokenUsage({
        inputTokens: data.usage.inputTokens,
        outputTokens: data.usage.outputTokens,
        availableTokens: data.usage.availableTokens
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }

    setIsTyping(false);
  };

  return (
    <main>
      <div className="token-usage" style={{ marginLeft: "600px" }}>
        <div>Input Tokens: {tokenUsage.inputTokens}</div>
        <div>Output Tokens: {tokenUsage.outputTokens}</div>
        <div>Available Tokens: {tokenUsage.availableTokens}</div>
      </div>
      <section>
        {chats && chats.length ? (
          chats.map((chat, index) => (
            <p key={index} className={chat.role === 'user' ? 'user_msg' : ''}>
              <span>
                <b>{chat.role.toUpperCase()}</b>
              </span>
              <span>:</span>
              <span>{chat.content}</span>
            </p>
          ))
        ) : (
          <p>No messages yet</p>
        )}
      </section>

      <div className={isTyping ? '' : 'hide'}>
        <p>
          <i>{isTyping ? 'Typing' : ''}</i>
        </p>
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          name="message"
          value={message}
          placeholder="Type a message here and hit Enter..."
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </main>
  );
}

export default Chatbot;
