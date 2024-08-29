import React, { useState, useEffect, useRef, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { VariableSizeList as List } from "react-window";
import "./Terminal.css";

const Terminal = () => {
  const [socketUrl] = useState(
    "wss://test-log-viewer-backend.stg.onepunch.agency/view-log-ws"
  );
  const [messageHistory, setMessageHistory] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef(null);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => {
        const newLogs = lastMessage.data.split("\n");
        const updatedLogs = [...prev, ...newLogs];
        return updatedLogs;
      });
    }
  }, [lastMessage]);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      setTimeout(() => {
        listRef.current.scrollToItem(messageHistory.length - 1, "end");
      }, 0);
    }
  }, [messageHistory, autoScroll]);

  const toggleAutoScroll = useCallback(() => {
    setAutoScroll((prevAutoScroll) => !prevAutoScroll);
  }, []);

  useEffect(() => {
    const handleClickSendMessage = () => {
      sendMessage("Hello");
    };
    if (readyState === ReadyState.OPEN) {
      handleClickSendMessage();
    }
  }, [sendMessage, readyState]);

  const getItemSize = (index) => {
    const length = messageHistory[index].length;
    return length < 60 ? 60 : 80;
  };

  const Row = ({ index, style }) => (
    <div style={style}>{messageHistory[index]}</div>
  );

  return (
    <div>
      <div className='terminal'>
        <div className='terminal-header'>
          <button onClick={toggleAutoScroll}>
            {autoScroll ? "Disable" : "Enable"} Auto Scroll
          </button>
        </div>
        <div className='terminal-body'>
          <List
            ref={listRef}
            height={500}
            itemCount={messageHistory.length}
            itemSize={getItemSize}
            width={"100%"}
          >
            {Row}
          </List>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
