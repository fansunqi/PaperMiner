"use client"; // Next.js 运行在客户端
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import '../src/app/globals.css';

// 动态加载 MathJax，防止 SSR 影响
const MathJaxContext = dynamic(() => import("better-react-mathjax").then(mod => mod.MathJaxContext), { ssr: false });
const MathJax = dynamic(() => import("better-react-mathjax").then(mod => mod.MathJax), { ssr: false });

export default function Home() {
  const [papers, setPapers] = useState([]);
  const [expandedAbstract, setExpandedAbstract] = useState(null); // 追踪哪个论文的摘要被展开
  const API_URL = "http://localhost:8000/papers/"; // 后端 API 地址

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
  
    // 正则表达式：匹配块级公式和内联公式
    const regex = /(\$\$.*?\$\$|\$.*?\$)/g;
  
    return text.split(regex).map((part, index) => {
      // 处理块级公式
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return <MathJax key={index} className="math-block">{part}</MathJax>; // 块级公式
      }
      // 处理内联公式
      else if (part.startsWith("$") && part.endsWith("$")) {
        return <MathJax key={index} className="math-inline">{part}</MathJax>; // 内联公式
      }
      // 处理非公式文本
      else {
        return part;
      }
    });
  };
  

  // 切换摘要的展开/收起状态
  const toggleAbstract = (paperId) => {
    setExpandedAbstract(prevState => {
      return prevState === paperId ? null : paperId; // 如果点击的是已展开的摘要，则收起它，否则展开
    });
  };

  return (
    <MathJaxContext config={{ tex: { displayMath: [["$$", "$$"]], inlineMath: [["$", "$"]] } }}>
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-900">📚 论文列表</h1>

        <div className="grid grid-cols-1 gap-8">
          {papers.map((paper) => {
            const codeLinks = Array.isArray(paper.code_links) ? paper.code_links : [];

            return (
              <div key={paper.paper_id ?? Math.random()} className="bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg p-8 border border-gray-200">
                {/* 论文标题 */}
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
                    {renderMath(expandedAbstract === paper.paper_id 
                      ? paper.abstract || "暂无摘要"
                      : (paper.abstract?.substring(0, 150) || "暂无摘要") + "..."
                    )}
                  </p>
                  {/* 摘要展开按钮 */}
                  <button
                    onClick={() => toggleAbstract(paper.paper_id)}
                    className="text-blue-500 hover:underline mt-2"
                  >
                    {expandedAbstract === paper.paper_id ? "收起摘要" : "展开摘要"}
                  </button>
                </div>

                {/* 详情按钮 */}
                <a href={`/paper/${paper.paper_id}`} className="mt-6 block text-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition duration-200">
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
