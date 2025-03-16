"use client"; // 确保是客户端组件

import { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState("加载中...");
  const API_URL = "http://localhost:8000/"; // 后端地址

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data); // 打印解析后的 data 值
        setMessage(data.message);
      })
      .catch((error) => console.error("API request failed:", error));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">FastAPI Status</h1>
      <p>{message}</p>
    </div>
  );
}

