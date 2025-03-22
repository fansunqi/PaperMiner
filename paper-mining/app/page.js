"use client"; // Next.js 运行在客户端
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import '../src/app/globals.css';

// 动态加载 MathJax，防止 SSR 影响
const MathJaxContext = dynamic(() => import("better-react-mathjax").then(mod => mod.MathJaxContext), { ssr: false });
const MathJax = dynamic(() => import("better-react-mathjax").then(mod => mod.MathJax), { ssr: false });

export default function Home() {
  const [papers, setPapers] = useState([]);
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

  // 解析数学公式（仅 $$...$$ 内的内容）
  const renderMath = (text) => {
    if (!text) return null;
    return text.split(/(\$\$.*?\$\$)/g).map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return <MathJax key={index} className="block text-center">{part}</MathJax>; // 居中渲染数学公式
      } else {
        return part; // 其余文本保持原样
      }
    });
  };

  return (
    <MathJaxContext config={{ tex: { displayMath: [["$$", "$$"]], inlineMath: [["$", "$"]] } }}>
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-900">📚 论文列表</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {papers.map((paper) => {
            const codeLinks = Array.isArray(paper.code_links) ? paper.code_links : [];

            return (
              <div key={paper.paper_id ?? Math.random()} className="bg-white shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg p-6 border border-gray-200">
                {/* 论文标题 */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{paper.title ?? "未知标题"}</h2>

                {/* 研究信息 */}
                <div className="space-y-2">
                  {[
                    { icon: "🔍", label: "研究任务", value: paper.tasks?.join(", ") || "无任务" },
                    { icon: "🛠", label: "研究方法", value: paper.methods?.join(", ") || "无方法" },
                    { icon: "📊", label: "数据集", value: paper.datasets?.join(", ") || "无数据集" },
                    { icon: "📈", label: "实验结果", value: paper.results?.join("; ") || "无实验结果" }
                  ].map(({ icon, label, value }, index) => (
                    <div key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-24 font-medium text-gray-700 flex items-center">
                        <span className="mr-2">{icon}</span> {label}:
                      </span>
                      <span className="text-gray-600 flex-1">{renderMath(value)}</span>
                    </div>
                  ))}
                </div>

                {/* 代码链接 */}
                {codeLinks.length > 0 && codeLinks[0] !== "None" && (
                  <div className="mt-4 mb-4 flex items-center">
                    <span className="flex-shrink-0 w-24 font-medium text-gray-700">💻 代码链接:</span>
                    <div className="flex space-x-2">
                      {codeLinks.map((link, index) => (
                        <a key={index} href={link} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition duration-200">
                          🔗 Link {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 摘要 */}
                <div className="mt-4">
                  <span className="flex-shrink-0 w-24 font-medium text-gray-700 flex items-center">
                    <span className="mr-2">📜</span> 摘要:
                  </span>
                  <p className="text-gray-600 leading-relaxed mt-1">
                    {renderMath(paper.abstract?.substring(0, 150) || "暂无摘要")}...
                  </p>
                </div>

                {/* 详情按钮 */}
                <a href={`/paper/${paper.paper_id}`} className="mt-4 block text-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition duration-200">
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
