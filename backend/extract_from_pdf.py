from zhipuai import ZhipuAI
from pathlib import Path
import json

# 初始化 ZhipuAI 客户端
API_KEY = "586b36330a8d459fbd4cae2459a1da29.OFoMugBBw7H2RA7M"  # 替换为你的 API key
client = ZhipuAI(api_key=API_KEY)

# 格式限制：.PDF .DOCX .DOC .XLS .XLSX .PPT .PPTX .PNG .JPG .JPEG .CSV .PY .TXT .MD .BMP .GIF
# 大小：单个文件50M、总数限制为100个文件
file_path = "pdf_data/(GG) MoE Vs. MLP on Tabular Data.pdf"
file_object = client.files.create(file=Path(file_path), purpose="file-extract")

# 获取文本内容
file_content = json.loads(client.files.content(file_id=file_object.id).content)["content"]

# 生成请求消息
message_content = f"请对\n{file_content}\n的内容进行分析，并撰写一份论文摘要。"

response = client.chat.completions.create(
    model="glm-4-long",  
    messages=[
        {"role": "user", "content": message_content}
    ],
)

print(response.choices[0].message)