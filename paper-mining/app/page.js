"use client"; // Next.js 运行在客户端
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import '../src/app/globals.css';

// 动态加载 MathJax，防止 SSR 影响
const MathJaxContext = dynamic(() => import("better-react-mathjax").then(mod => mod.MathJaxContext), { ssr: false });
const MathJax = dynamic(() => import("better-react-mathjax").then(mod => mod.MathJax), { ssr: false });

export default function Home() {
  const [papers, setPapers] = useState([]); // 当前页的论文数据
  const [page, setPage] = useState(1); // 当前页码
  const [pageSize] = useState(10); // 每页显示的论文数量
  const [total, setTotal] = useState(0); // 总论文数量
  const [loading, setLoading] = useState(false); // 加载状态
  const [expandedAbstracts, setExpandedAbstracts] = useState([]); // 追踪哪些论文的摘要被展开
  const [selectedTab, setSelectedTab] = useState("metadata"); // 追踪当前选中的标签
  const API_URL = "http://localhost:8000/papers/"; // 后端 API 地址

  // 加载当前页数据
  const fetchPapers = async (currentPage) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?page=${currentPage}&page_size=${pageSize}`);
      const data = await response.json();
      setPapers(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error("API 请求失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载第一页数据
  useEffect(() => {
    fetchPapers(page);
  }, [page]);

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
    setExpandedAbstracts((prevState) => {
      if (prevState.includes(paperId)) {
        // 如果摘要已展开，则收起它
        return prevState.filter((id) => id !== paperId);
      } else {
        // 如果摘要未展开，则展开它
        return [...prevState, paperId];
      }
    });
  };

  // 分页按钮点击事件
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / pageSize)) {
      setPage(newPage);
    }
  };

  // 生成分页按钮
  const renderPagination = () => {
    const totalPages = Math.ceil(total / pageSize);
    const pagination = [];

    if (totalPages <= 5) {
      // 如果总页数小于等于 5，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pagination.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded-md ${page === i ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"} transition duration-200`}
          >
            {i}
          </button>
        );
      }
    } else {
      // 如果总页数大于 5，显示部分页码
      if (page > 2) {
        pagination.push(
          <button
            key={1}
            onClick={() => handlePageChange(1)}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
          >
            1
          </button>
        );
        if (page > 3) {
          pagination.push(<span key="start-ellipsis" className="px-3 py-1">...</span>);
        }
      }

      for (let i = Math.max(1, page - 1); i <= Math.min(page + 1, totalPages); i++) {
        pagination.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded-md ${page === i ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"} transition duration-200`}
          >
            {i}
          </button>
        );
      }

      if (page < totalPages - 1) {
        if (page < totalPages - 2) {
          pagination.push(<span key="end-ellipsis" className="px-3 py-1">...</span>);
        }
        pagination.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
          >
            {totalPages}
          </button>
        );
      }
    }

    return pagination;
  };

  return (
    <MathJaxContext config={{ tex: { displayMath: [["$$", "$$"]], inlineMath: [["$", "$"]] } }}>
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-900">📚 论文列表</h1>

        {/* 添加两个链接 */}
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

        {/* 论文列表 */}
        <div className="grid grid-cols-1 gap-8">
          {loading ? (
            <p className="text-center text-gray-500">加载中...</p>
          ) : (
            papers.map((paper) => {
              const codeLinks = Array.isArray(paper.code_links) ? paper.code_links : [];
              const tasks = Array.isArray(paper.tasks) ? paper.tasks : ["无任务"];
              const datasets = Array.isArray(paper.datasets) ? paper.datasets : ["无数据集"];
              const methods = Array.isArray(paper.methods) ? paper.methods : ["无方法"];
              const results = Array.isArray(paper.results) ? paper.results : ["无实验结果"];

              return (
                <div key={paper.paper_id ?? Math.random()} className="bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-lg p-8 border border-gray-200">
                  {/* 论文标题 */}
                  <h2 className="text-3xl font-semibold text-gray-900 mb-6">{paper.title ?? "未知标题"}</h2>

                  {/* 研究信息 */}
                  <div className="space-y-4">
                    {[
                      { icon: "🔍", label: "研究任务", value: tasks.join(", ") },
                      { icon: "🛠", label: "研究方法", value: methods.join(", ") },
                      { icon: "📊", label: "数据集", value: datasets.join(", ") },
                      { icon: "📈", label: "实验结果", value: results.join("; ") }
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
                      {renderMath(expandedAbstracts.includes(paper.paper_id) 
                        ? paper.abstract || "暂无摘要"
                        : (paper.abstract?.substring(0, 150) || "暂无摘要") + "..."
                      )}
                    </p>
                    {/* 摘要展开按钮 */}
                    <button
                      onClick={() => toggleAbstract(paper.paper_id)}
                      className="text-blue-500 hover:underline mt-2"
                    >
                      {expandedAbstracts.includes(paper.paper_id) ? "收起摘要" : "展开摘要"}
                    </button>
                  </div>

                  {/* 详情按钮 */}
                  <a href={`/paper/${paper.title}`} className="mt-6 block text-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition duration-200">
                    📖 查看详情 →
                  </a>
                </div>
              );
            })
          )}
        </div>

        {/* 分页按钮 */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md ${page === 1 ? "bg-gray-300 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"} transition duration-200`}
          >
            上一页
          </button>

          {/* 页号显示 */}
          <div className="flex space-x-2">
            {renderPagination()}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
            className={`px-4 py-2 rounded-md ${page >= Math.ceil(total / pageSize) ? "bg-gray-300 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"} transition duration-200`}
          >
            下一页
          </button>

          {/* 输入框跳转 */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">跳转到:</span>
            <input
              type="number"
              min="1"
              max={Math.ceil(total / pageSize)}
              placeholder="页码"
              className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const inputPage = parseInt(e.target.value, 10);
                  if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= Math.ceil(total / pageSize)) {
                    handlePageChange(inputPage);
                  } else {
                    alert("请输入有效的页码！");
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
}