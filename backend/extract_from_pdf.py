from zhipuai import ZhipuAI
from pathlib import Path
import json
from pprint import pprint

# 初始化 ZhipuAI 客户端
API_KEY = "586b36330a8d459fbd4cae2459a1da29.OFoMugBBw7H2RA7M"  # 替换为你的 API key
client = ZhipuAI(api_key=API_KEY)


# 读取示例文件
def load_example():
    """加载示例文件作为 in-context learning 例子"""
    example_path = "backend/examples/01.json"
    try:
        with open(example_path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: Could not load example file: {e}")
        return None
   
    
# 格式限制：.PDF .DOCX .DOC .XLS .XLSX .PPT .PPTX .PNG .JPG .JPEG .CSV .PY .TXT .MD .BMP .GIF
# 大小：单个文件50M、总数限制为100个文件
file_path = "pdf_data/(GG) MoE Vs. MLP on Tabular Data.pdf"
file_object = client.files.create(file=Path(file_path), purpose="file-extract")
file_content = json.loads(client.files.content(file_id=file_object.id).content)["content"]

example_file_path = "backend/examples/01.pdf"
example_file_object = client.files.create(file=Path(example_file_path), purpose="file-extract")
example_file_content = json.loads(client.files.content(file_id=example_file_object.id).content)["content"]

example = load_example()

# 生成请求消息
message_content = f"""
请对论文内容进行分析，并提取出关键信息。

示例论文：
{example_file_content}

提取结果：
{{
    "code_links": "{example.get('Code links', 'None')}",
    "tasks": {json.dumps(example.get('Tasks', ['None']), ensure_ascii=False)},
    "datasets": {json.dumps(example.get('Datasets', ['None']), ensure_ascii=False)},
    "methods": {json.dumps(example.get('Methods', ['None']), ensure_ascii=False)},
    "results": {json.dumps(example.get('Results', ['None']), ensure_ascii=False)}
}}

现在，请你以相同的格式分析下面这篇论文:

论文内容：
{file_content}

请提取：
1. Code links: 代码链接，例如 GitHub 仓库 URL
2. Tasks: 研究的任务/问题，例如 "Video Question Answering"
3. Datasets: 使用的数据集，例如 "ImageNet", "COCO"
4. Methods: 使用的方法/技术，例如 "Transformer", "RLHF"
5. Results: 关键结果和指标，例如 "BLEU: 56.7"

请使用简洁的术语或短语回答，不要有冗余描述。如果某一项信息不存在，请标记为"None"。
以JSON格式返回结果，确保每个字段都是列表形式。
"""

response = client.chat.completions.create(
    model="glm-4-long",  
    messages=[
        {"role": "user", "content": message_content}
    ],
)

content = response.choices[0].message.content
pprint(content)


