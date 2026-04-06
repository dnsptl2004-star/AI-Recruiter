"use client";
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const TimerComponent = forwardRef((props, ref) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useImperativeHandle(ref, () => ({
    start: () => setRunning(true),
    stop: () => setRunning(false),
    reset: () => setSecondsElapsed(0),
  }));

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return <span>{formatTime(secondsElapsed)}</span>;
});

export default TimerComponent;
