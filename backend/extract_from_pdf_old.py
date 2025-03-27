import os
from tqdm import tqdm
from zhipuai import ZhipuAI
from pathlib import Path
import json
from pprint import pprint
import time
from data_io import extract_abstract_from_pdf

# 初始化 ZhipuAI 客户端
API_KEY = "586b36330a8d459fbd4cae2459a1da29.OFoMugBBw7H2RA7M"  # 替换为你的 API key
client = ZhipuAI(api_key=API_KEY)

pdf_base_dir = "/share_data/paper/data"

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


example_file_path = "backend/examples/01.pdf"
example_file_object = client.files.create(file=Path(example_file_path), purpose="file-extract")
example_file_content = json.loads(client.files.content(file_id=example_file_object.id).content)["content"]

example = load_example()
example_prompt = ""
if example:
    example_prompt = f"""
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
    """


def extract_paper_info(file_path): 
     
    try:
        # 格式限制：.PDF .DOCX .DOC .XLS .XLSX .PPT .PPTX .PNG .JPG .JPEG .CSV .PY .TXT .MD .BMP .GIF
        # 大小：单个文件50M、总数限制为100个文件
        # file_path = "pdf_data/(GG) MoE Vs. MLP on Tabular Data.pdf"
        file_object = client.files.create(file=Path(file_path), purpose="file-extract")
        file_content = json.loads(client.files.content(file_id=file_object.id).content)["content"]

        
        # 生成请求消息
        message_content = f"""
        请对论文内容进行分析，并提取出关键信息。

        {example_prompt}

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
            # model="glm-4-long",
            model="glm-4-flash",  
            messages=[
                {"role": "user", "content": message_content}
            ],
        )

        content = response.choices[0].message.content

        # 尝试解析 JSON
        try:
            # 查找 JSON 对象的边界
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx >= 0 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                result = json.loads(json_str)
            else:
                # 如果找不到 JSON，则手动构建结构
                result = {
                    "code_links": "None",
                    "tasks": ["None"],
                    "datasets": ["None"],
                    "methods": ["None"],
                    "results": ["None"],
                    "raw_response": content
                }
        except json.JSONDecodeError:
            # 如果 JSON 解析失败，则手动构建结构
            result = {
                "code_links": "None",
                "tasks": ["None"],
                "datasets": ["None"],
                "methods": ["None"],
                "results": ["None"],
                "raw_response": content
            }
        
        # 删除文件  
        _ = client.files.delete(
            file_id=file_object.id        #支持retrieval、batch、fine-tune、file-extract文件
        )
            
        return result
    except Exception as e:
        print(f"Error extracting information: {e}")
        return {
            "code_links": "None",
            "tasks": ["None"],
            "datasets": ["None"], 
            "methods": ["None"],
            "results": ["None"],
            "error": str(e)
        }


def main():
    # 读取论文数据
    pdf_files = os.listdir(pdf_base_dir)
    # pdf_files = pdf_files[:10]
    print(f"Total number of papers: {len(pdf_files)}")

    # 创建输出目录
    output_dir = "outputs/pdf"
    # os.makedirs(output_dir, exist_ok=True)

    # 记录已处理的论文ID
    # processed_files_record = os.path.join(output_dir, "processed_files.txt")
    # processed_files = set()

    # 如果存在处理记录，加载它
    # if os.path.exists(processed_files_record):
    #     with open(processed_files_record, "r") as f:
    #         processed_files = set(line.strip() for line in f)
    
    # 记录已处理的论文ID
    processed_files = set()

    # 遍历 output_dir 中的文件，提取已处理的论文 ID
    if os.path.exists(output_dir):
        for filename in os.listdir(output_dir):
            if filename.endswith(".json") and filename != "all_results.json":
                paper_id = filename[:-5]  # 去掉 ".json" 后缀
                processed_files.add(paper_id)
    
    for pdf_file in tqdm(pdf_files, desc="Extracting paper information"):
        # 跳过已处理的论文
        if pdf_file in processed_files:
            print("Skipping paper", pdf_file)
            continue
        
        pdf_path = os.path.join(pdf_base_dir, pdf_file)

        abstract = extract_abstract_from_pdf(pdf_path)

        # if not abstract:
        #     print(f"Skipping paper {pdf_file} due to missing abstract")
        #     continue
        

        info = extract_paper_info(pdf_path)
        info["title"] = pdf_file
        info["abstract"] = abstract

        # 保存结果
        output_file = os.path.join(output_dir, f"{pdf_file}.json")
        with open(output_file, "w") as f:
            json.dump(info, f, indent=2)
            
        # 记录该论文已处理
        # with open(processed_files_record, "a") as f:
        #     f.write(f"{pdf_file}\n")
        print("Processed paper", pdf_file)
            
        # 防止API调用过快
        time.sleep(0.5)
    
    # 汇总所有结果
    # aggregate_results(output_dir)

def aggregate_results(output_dir):
    """汇总所有提取结果到一个文件中"""
    all_results = {}
    
    for filename in os.listdir(output_dir):
        if filename.endswith(".json") and filename != "all_results.json":
            file_path = os.path.join(output_dir, filename)
            with open(file_path, "r") as f:
                paper_info = json.load(f)
                paper_id = paper_info.get("paper_id", filename[:-5])
                all_results[paper_id] = paper_info
    
    # 保存汇总结果
    with open(os.path.join(output_dir, "all_results.json"), "w") as f:
        json.dump(all_results, f, indent=2)
    
    print(f"Aggregated {len(all_results)} paper extraction results")


if __name__ == "__main__":
    main()


# TODO 增加 systerm

