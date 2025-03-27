from zhipuai import ZhipuAI
from pprint import pprint
import pdb

# 初始化 ZhipuAI 客户端
API_KEY = "586b36330a8d459fbd4cae2459a1da29.OFoMugBBw7H2RA7M"  # 替换为你的 API key
client = ZhipuAI(api_key=API_KEY)

# 请求知识库文件列表
# 请求文件列表
result = client.files.list(
    purpose="file-extract",    #支持batch、file-extract、fine-tune
)
pprint(result)
print(len(result.data))

for file in result.data:
    print(f"deleting {file.id}")
    result = client.files.delete(
        file_id=file.id         #支持retrieval、batch、fine-tune、file-extract文件
    )