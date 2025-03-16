from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
import requests
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 配置 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)

# 连接 MongoDB
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["paper_mining"]
papers_collection = db["papers"]

# GLM API 配置
GLM_API_URL = "https://open.bigmodel.cn/api/fileqa"
GLM_API_KEY = os.getenv("GLM_API_KEY")

@app.get("/")
def read_root():
    print("FastAPI 运行成功！")
    return {"message": "FastAPI 运行成功！"}

@app.get("/papers/")
def get_papers(skip: int = 0, limit: int = 10):
    """获取论文列表"""
    papers = list(papers_collection.find({}, {"_id": 0}).skip(skip).limit(limit))
    return {"papers": papers}

@app.get("/papers/{paper_id}")
def get_paper_details(paper_id: str):
    """获取论文详情"""
    paper = papers_collection.find_one({"id": paper_id}, {"_id": 0})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper

@app.post("/extract_info/")
def extract_info_from_pdf(paper_id: str, file_path: str):
    """使用 GLM-4-Flash API 从 PDF 提取关键信息"""
    headers = {"Authorization": f"Bearer {GLM_API_KEY}"}
    data = {"file_path": file_path}
    
    response = requests.post(GLM_API_URL, headers=headers, json=data)
    
    if response.status_code == 200:
        extracted_info = response.json()
        papers_collection.update_one({"id": paper_id}, {"$set": extracted_info})
        return {"message": "Extraction successful", "data": extracted_info}
    else:
        raise HTTPException(status_code=500, detail="Extraction failed")
