// "use client"; // 确保是客户端组件

// import { useState, useEffect } from "react";

// export default function Home() {
//   const [message, setMessage] = useState("加载中...");
//   const API_URL = "http://localhost:8000/"; // 后端地址

//   useEffect(() => {
//     fetch(API_URL)
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         console.log("Fetched data:", data); // 打印解析后的 data 值
//         setMessage(data.message);
//       })
//       .catch((error) => console.error("API request failed:", error));
//   }, []);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold">FastAPI Status</h1>
//       <p>{message}</p>
//     </div>
//   );
// }


// "use client"; // 确保是客户端组件

// import { useState, useEffect } from "react";

// export default function Home() {
//   const [papers, setPapers] = useState([]);
//   const API_URL = "http://localhost:8000/papers/"; // 后端 API 地址

//   useEffect(() => {
//     fetch(API_URL)
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Received papers:", data); // 调试数据
//         setPapers(Object.values(data)); // 转换 JSON 对象为数组
//       })
//       .catch((error) => console.error("API 请求失败:", error));
//   }, []);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">论文列表</h1>
//       <ul>
//         {papers.map((paper) => (
//           <li key={paper.paper_id} className="border-b p-4">
//             <h2 className="text-xl font-semibold">{paper.title}</h2>
//             <p className="text-gray-700">{paper.abstract.substring(0, 150)}...</p>
//             <a href={`/paper/${paper.paper_id}`} className="text-blue-500">
//               查看详情
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


// "use client"; // 确保组件运行在客户端

// import { useState, useEffect } from "react";

// export default function Home() {
//   const [papers, setPapers] = useState([]);
//   const API_URL = "http://localhost:8000/papers/"; // FastAPI 后端 API

//   useEffect(() => {
//     fetch(API_URL)
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Received papers:", data); // 调试数据
//         setPapers(Object.values(data)); // 将 JSON 对象转换为数组
//       })
//       .catch((error) => console.error("API 请求失败:", error));
//   }, []);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">论文列表</h1>
//       <ul className="space-y-6">
//         {papers.map((paper) => (
//           <li key={paper.paper_id} className="border p-4 rounded-lg shadow">
//             {/* 论文标题 */}
//             <h2 className="text-xl font-semibold">{paper.title}</h2>

//             {/* 研究任务 */}
//             {paper.tasks.length > 0 && paper.tasks[0] !== "None" && (
//               <p><strong>研究任务:</strong> {paper.tasks.join(", ")}</p>
//             )}

//             {/* 研究方法 */}
//             {paper.methods.length > 0 && paper.methods[0] !== "None" && (
//               <p><strong>研究方法:</strong> {paper.methods.join(", ")}</p>
//             )}

//             {/* 数据集 */}
//             {paper.datasets.length > 0 && paper.datasets[0] !== "None" && (
//               <p><strong>数据集:</strong> {paper.datasets.join(", ")}</p>
//             )}

//             {/* 实验结果 */}
//             {paper.results.length > 0 && paper.results[0] !== "None" && (
//               <p><strong>实验结果:</strong> {paper.results.join("; ")}</p>
//             )}

//             {/* 代码链接 */}
//             {paper.code_links.length > 0 && paper.code_links[0] !== "None" && (
//               <p>
//                 <strong>代码链接:</strong>{" "}
//                 {paper.code_links.map((link, index) => (
//                   <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
//                     {link}
//                   </a>
//                 ))}
//               </p>
//             )}

//             {/* 摘要（只展示前 150 字符） */}
//             <p className="text-gray-600 mt-2">
//               <strong>摘要:</strong> {paper.abstract.substring(0, 150)}...
//             </p>

//             {/* 详情链接 */}
//             <a href={`/paper/${paper.paper_id}`} className="text-blue-600 mt-2 inline-block">
//               查看详情 →
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


"use client"; // 让 Next.js 知道这个组件在客户端运行

import { useState, useEffect } from "react";

export default function Home() {
  const [papers, setPapers] = useState([]);
  const API_URL = "http://localhost:8000/papers/"; // FastAPI 后端 API

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">论文列表</h1>
      <ul className="space-y-6">
        {papers.map((paper) => {
          const codeLinks = Array.isArray(paper.code_links) ? paper.code_links : [];

          return (
            <li key={paper.paper_id ?? Math.random()} className="border p-4 rounded-lg shadow">
              {/* 论文标题 */}
              <h2 className="text-xl font-semibold">{paper.title ?? "未知标题"}</h2>

              {/* 研究任务 */}
              <p>
                <strong>研究任务:</strong> {paper.tasks?.length ? paper.tasks.join(", ") : "无任务"}
              </p>

              {/* 研究方法 */}
              <p>
                <strong>研究方法:</strong> {paper.methods?.length ? paper.methods.join(", ") : "无方法"}
              </p>

              {/* 数据集 */}
              <p>
                <strong>数据集:</strong> {paper.datasets?.length ? paper.datasets.join(", ") : "无数据集"}
              </p>

              {/* 实验结果 */}
              <p>
                <strong>实验结果:</strong> {paper.results?.length ? paper.results.join("; ") : "无实验结果"}
              </p>

              {/* 代码链接（如果 code_links 存在且不为空） */}
              {codeLinks.length > 0 && codeLinks[0] !== "None" && (
                <p>
                  <strong>代码链接:</strong>{" "}
                  {codeLinks.map((link, index) => (
                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 mx-1">
                      [{index + 1}]
                    </a>
                  ))}
                </p>
              )}

              {/* 摘要（只展示前 150 个字符） */}
              <p className="text-gray-600 mt-2">
                <strong>摘要:</strong> {paper.abstract ? paper.abstract.substring(0, 150) : "暂无摘要"}...
              </p>

              {/* 详情链接 */}
              <a href={`/paper/${paper.paper_id}`} className="text-blue-600 mt-2 inline-block">
                查看详情 →
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
