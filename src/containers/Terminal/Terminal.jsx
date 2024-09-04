import React, { useState, useCallback, useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { FixedSizeList as List } from "react-window";
import Button from "../../components/Button/Button.jsx";

const Row = React.memo(({ index, style, data }) => (
  <div style={style}>{data[index]}</div>
));

export const Terminal = () => {
  const [socketUrl] = useState(
    "wss://test-log-viewer-backend.stg.onepunch.agency/view-log-ws"
  );
  const [logs, setLogs] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const listRef = useRef(null);
  const listInstance = useRef(null);

  const { sendMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    onMessage: isPaused ? null : (message) => handleLogMessage(message),
  });

  const handleLogMessage = useCallback((message) => {
    setLogs((prevLogs) => {
      let updatedLogs = [...prevLogs, message.data];
      setItemCount(updatedLogs.length);
      if (updatedLogs.length > 2000) {
        updatedLogs = updatedLogs.slice(-2000);
      }
      return updatedLogs;
    });
  }, []);

  useEffect(() => {
    if (listInstance.current) {
      listInstance.current.scrollToItem(itemCount - 1, "end");
    }
  }, [logs, itemCount]);

  const fetchOldLogs = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const newLogs = logs.slice(startIndex, startIndex + 100);
      setLogs((prevLogs) => {
        let updatedLogs = [...prevLogs, ...newLogs];
        setItemCount(updatedLogs.length);
        if (updatedLogs.length > 2000) {
          updatedLogs = updatedLogs.slice(-2000);
        }
        return updatedLogs;
      });
      setStartIndex(startIndex + 100);
      setLoading(false);
      if (newLogs.length < 100) {
        setHasMore(false);
      }
    }, 500);
  }, [logs, startIndex]);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0 && !loading && hasMore) {
      fetchOldLogs();
    }
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className='terminal' onScroll={handleScroll} ref={listRef}>
      <Button onClick={() => sendMessage("Hello")}>Start logging</Button>
      <Button onClick={handlePauseToggle}>
        {isPaused ? "Resume Logging" : "Pause Logging"}
      </Button>
      <List
        height={700}
        itemCount={itemCount}
        itemSize={20}
        width='100%'
        itemData={logs}
        ref={listInstance}
      >
        {Row}
      </List>
      {loading && <div>Loading more logs...</div>}
    </div>
  );
};

export default Terminal;
