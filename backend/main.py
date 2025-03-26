from fastapi import FastAPI, HTTPException, Query
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
OUTPUT_META_DATA_PATH = "../outputs/meta"

def load_meta_data(directory):
    meta_data_list = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.json'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    meta_data_list.append(data)
    return meta_data_list

meta_data = load_meta_data(OUTPUT_META_DATA_PATH)

with open("../outputs/pdf/all_results.json", "r", encoding="utf-8") as f:
    pdf_data = json.load(f)

@app.get("/")
def read_root():
    print("FastAPI 运行成功！")
    return {"message": "FastAPI 运行成功！"}

@app.get("/papers/")
def get_papers(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1)):
    """
    返回分页后的论文数据
    - page: 当前页码，从 1 开始
    - page_size: 每页返回的论文数量
    """
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_data = meta_data[start_index:end_index]

    if not paginated_data:
        raise HTTPException(status_code=404, detail="没有更多数据")

    return {
        "page": page,
        "page_size": page_size,
        "total": len(meta_data),
        "data": paginated_data
    }

@app.get("/pdf-papers/")
def get_pdf_papers(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1)):
    """
    返回分页后的 PDF 论文数据
    - page: 当前页码，从 1 开始
    - page_size: 每页返回的论文数量
    """
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_data = pdf_data[start_index:end_index]

    if not paginated_data:
        raise HTTPException(status_code=404, detail="没有更多数据")

    return {
        "page": page,
        "page_size": page_size,
        "total": len(pdf_data),
        "data": paginated_data
    }