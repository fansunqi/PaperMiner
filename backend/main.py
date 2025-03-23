from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
import requests
import os
from fastapi.middleware.cors import CORSMiddleware
import json

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

# 加载 JSON 数据
with open("../outputs/paper_extractions/all_results.json", "r", encoding="utf-8") as f:
    papers_data = json.load(f)
    
with open("../outputs/pdf/all_results.json", "r", encoding="utf-8") as f:
    pdf_data = json.load(f)

@app.get("/")
def read_root():
    print("FastAPI 运行成功！")
    return {"message": "FastAPI 运行成功！"}

@app.get("/papers/")
def get_papers():
    """返回所有论文数据"""
    return papers_data

@app.get("/pdf-papers/")
def get_pdf_papers():
    """返回所有 PDF 论文数据"""
    return pdf_data