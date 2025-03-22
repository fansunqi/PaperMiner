"use client"; // 让 Next.js 运行在客户端


import { useState, useEffect } from "react";
import '../src/app/globals.css';

export default function Home() {
  const [papers, setPapers] = useState([]);
  const API_URL = "http://localhost:8000/papers/"; // FastAPI 后端 API 地址

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Received papers:", data); // 调试数据
        setPapers(Object.values(data)); // 将 JSON 对象转换为数组
      })
      .catch((error) => console.error("API 请求失败:", error));
  }, []);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">📚 论文列表</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => {
          const codeLinks = Array.isArray(paper.code_links) ? paper.code_links : [];
          
          return (
            <div key={paper.paper_id ?? Math.random()} className="bg-white shadow-lg rounded-xl p-6 border">
              {/* 论文标题 */}
              <h2 className="text-2xl font-semibold text-gray-900">{paper.title ?? "未知标题"}</h2>

              {/* 研究任务 */}
              <p className="text-gray-600 mt-2">
                <strong className="text-gray-800">🔍 研究任务:</strong>{" "}
                {paper.tasks?.length ? paper.tasks.join(", ") : "无任务"}
              </p>

              {/* 研究方法 */}
              <p className="text-gray-600">
                <strong className="text-gray-800">🛠️ 研究方法:</strong>{" "}
                {paper.methods?.length ? paper.methods.join(", ") : "无方法"}
              </p>

              {/* 数据集 */}
              <p className="text-gray-600">
                <strong className="text-gray-800">📊 数据集:</strong>{" "}
                {paper.datasets?.length ? paper.datasets.join(", ") : "无数据集"}
              </p>

              {/* 实验结果 */}
              <p className="text-gray-600">
                <strong className="text-gray-800">📈 实验结果:</strong>{" "}
                {paper.results?.length ? paper.results.join("; ") : "无实验结果"}
              </p>

              {/* 代码链接（如果 code_links 存在且不为空） */}
              {codeLinks.length > 0 && codeLinks[0] !== "None" && (
                <div className="mt-3">
                  <strong className="text-gray-800">💻 代码链接:</strong>{" "}
                  {codeLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition duration-200 mx-1"
                    >
                      🔗 Link {index + 1}
                    </a>
                  ))}
                </div>
              )}

              {/* 摘要（截取前 150 字） */}
              <p className="text-gray-600 mt-3">
                <strong className="text-gray-800">📜 摘要:</strong>{" "}
                {paper.abstract ? paper.abstract.substring(0, 150) : "暂无摘要"}...
              </p>

              {/* 详情链接 */}
              <a
                href={`/paper/${paper.paper_id}`}
                className="mt-4 inline-block px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition duration-200"
              >
                📖 查看详情 →
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
