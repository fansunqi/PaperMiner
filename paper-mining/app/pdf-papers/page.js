"use client"; // Next.js 运行在客户端
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import '../../src/app/globals.css';

// 动态加载 MathJax，防止 SSR 影响
const MathJaxContext = dynamic(() => import("better-react-mathjax").then(mod => mod.MathJaxContext), { ssr: false });
const MathJax = dynamic(() => import("better-react-mathjax").then(mod => mod.MathJax), { ssr: false });

export default function Home() {
  const [papers, setPapers] = useState([]);
  const [expandedAbstracts, setExpandedAbstracts] = useState([]); // 追踪哪些论文的摘要被展开
  const [selectedTab, setSelectedTab] = useState("pdf"); // 追踪当前选中的标签
  const API_URL = "http://localhost:8000/pdf-papers/"; // 后端 API 地址

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Received papers:", data); // 调试数据
        setPapers(Object.values(data));
      })
      .catch((error) => console.error("API 请求失败:", error));
  }, []);

  const renderMath = (text) => {
    if (!text) return null;
    const regex = /(\$\$.*?\$\$|\$.*?\$)/g;
    return text.split(regex).map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return <MathJax key={index} className="math-block">{part}</MathJax>;
      } else if (part.startsWith("$") && part.endsWith("$")) {
        return <MathJax key={index} className="math-inline">{part}</MathJax>;
      } else {
        return part;
      }
    });
  };

  const toggleAbstract = (paperId) => {
    setExpandedAbstracts((prevState) => {
      if (prevState.includes(paperId)) {
        return prevState.filter((id) => id !== paperId);
      } else {
        return [...prevState, paperId];
      }
    });
  };

  return (
    <MathJaxContext config={{ tex: { displayMath: [["$$", "$$"]], inlineMath: [["$", "$"]] } }}>
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-900">📚 论文列表</h1>
        <div className="flex justify-center space-x-4 mb-8">
          <Link href="/" legacyBehavior>
            <a
              className={`px-4 py-2 rounded-md transition duration-200 ${selectedTab === "metadata" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setSelectedTab("metadata")}
            >
              从元数据提取的论文信息
            </a>
          </Link>
          <Link href="/pdf-papers" legacyBehavior>
            <a
              className={`px-4 py-2 rounded-md transition duration-200 ${selectedTab === "pdf" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              onClick={() => setSelectedTab("pdf")}
            >
              从 PDF 提取的论文信息
            </a>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8">
          {papers.map((paper, index) => {
            const codeLinks = Array.isArray(paper.code_links) ? paper.code_links : [];
            const paperId = paper.paper_id ?? `temp-${index}`;
            const isExpanded = expandedAbstracts.includes(paperId);
            return (
              <div key={paperId} className="bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg p-8 border border-gray-200">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">{paper.title ?? "未知标题"}</h2>

                 {/* 研究信息 */}
                 <div className="space-y-4">
                  {[
                    { icon: "🔍", label: "研究任务", value: paper.tasks?.join(", ") || "无任务" },
                    { icon: "🛠", label: "研究方法", value: paper.methods?.join(", ") || "无方法" },
                    { icon: "📊", label: "数据集", value: paper.datasets?.join(", ") || "无数据集" },
                    { icon: "📈", label: "实验结果", value: paper.results?.join("; ") || "无实验结果" }
                  ].map(({ icon, label, value }, index) => (
                    <div key={index} className="flex flex-col space-y-2">
                      <span className="text-lg font-medium text-gray-700">{icon} {label}:</span>
                      <div className="flex flex-wrap gap-2">
                        {value.split(",").map((item, index) => (
                          <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {renderMath(item.trim())}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 代码链接 */}
                {codeLinks.length > 0 && codeLinks[0] !== "None" && (
                  <div className="mt-6 flex items-center space-x-4">
                    <span className="flex-shrink-0 text-lg font-medium text-gray-700">💻 代码链接:</span>
                    <div className="flex space-x-3">
                      {codeLinks.map((link, index) => (
                        <a key={index} href={link} target="_blank" rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition duration-200">
                          🔗 Link {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 摘要 */}
                <div className="mt-6">
                  <span className="text-lg font-medium text-gray-700 flex items-center">
                    <span className="mr-2">📜</span> 摘要:
                  </span>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    {renderMath(isExpanded 
                      ? paper.abstract || "暂无摘要"
                      : (paper.abstract?.substring(0, 150) || "暂无摘要") + "..."
                    )}
                  </p>
                  <button
                    onClick={() => toggleAbstract(paperId)}
                    className="text-blue-500 hover:underline mt-2"
                  >
                    {isExpanded ? "收起摘要" : "展开摘要"}
                  </button>
                </div>
                <a href={`/paper/${paperId}`} className="mt-6 block text-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition duration-200">
                  📖 查看详情 →
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </MathJaxContext>
  );
}
