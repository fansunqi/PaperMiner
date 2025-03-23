# 使用 zhipuai API 抽取论文元数据中的关键信息
import json
import os
import time
from tqdm import tqdm
from zhipuai import ZhipuAI
from data_io import read_all_meta_data

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

def extract_paper_info(title, abstract):
    """使用智谱 API 从论文标题和摘要中提取关键信息"""
    # 加载示例
    example = load_example()
    
    # 构建包含示例的提示词
    example_prompt = ""
    if example:
        example_prompt = f"""
        示例论文:
        标题: {example['title']}
        摘要: {example['abstract']}
        
        提取结果:
        {{
            "code_links": "{example.get('Code links', 'None')}",
            "tasks": {json.dumps(example.get('Tasks', ['None']), ensure_ascii=False)},
            "datasets": {json.dumps(example.get('Datasets', ['None']), ensure_ascii=False)},
            "methods": {json.dumps(example.get('Methods', ['None']), ensure_ascii=False)},
            "results": {json.dumps(example.get('Results', ['None']), ensure_ascii=False)}
        }}
        
        现在，请你以相同的格式分析下面这篇论文:
        """
    
    prompt = f"""
    请从论文的标题和摘要中提取关键信息：

    {example_prompt}
    
    标题: {title}
    摘要: {abstract}
    
    请提取：
    1. Code links: 代码链接，例如 GitHub 仓库 URL
    2. Tasks: 研究的任务/问题，例如 "Video Question Answering"
    3. Datasets: 使用的数据集，例如 "ImageNet", "COCO"
    4. Methods: 使用的方法/技术，例如 "Transformer", "RLHF"
    5. Results: 关键结果和指标，例如 "BLEU: 56.7"
    
    请使用简洁的术语或短语回答，不要有冗余描述。如果某一项信息不存在，请标记为"None"。
    以JSON格式返回结果，确保每个字段都是列表形式。
    """
    
    try:
        response = client.chat.completions.create(
            model="glm-4-plus",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,  # 低温度，减少创造性，增加确定性
        )
        
        # 从响应中提取内容
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
    # 读取论文元数据
    papers = read_all_meta_data()
    papers = papers[:10]
    print(f"Total number of papers: {len(papers)}")
    
    # 创建输出目录
    output_dir = "outputs/paper_extractions"
    os.makedirs(output_dir, exist_ok=True)
    
    # 记录已处理的论文ID
    processed_ids_file = os.path.join(output_dir, "processed_ids.txt")
    processed_ids = set()
    
    # 如果存在处理记录，加载它
    # if os.path.exists(processed_ids_file):
    #     with open(processed_ids_file, "r") as f:
    #         processed_ids = set(line.strip() for line in f)
    
    # 处理每篇论文
    for paper in tqdm(papers, desc="Extracting paper information"):
        paper_id = paper.get("_id", "")
        
        # 跳过已处理的论文
        if paper_id in processed_ids:
            continue
        
        title = paper.get("title", "")
        abstract = paper.get("abstract", "")
        
        # 如果没有摘要，跳过该论文
        if not abstract:
            print(f"Skipping paper {paper_id} due to missing abstract")
            continue
            
        # 提取信息
        info = extract_paper_info(title, abstract)
        
        # 添加论文基本信息
        info["paper_id"] = paper_id
        info["title"] = title
        info["abstract"] = abstract
        
        # 保存结果
        output_file = os.path.join(output_dir, f"{paper_id}.json")
        with open(output_file, "w") as f:
            json.dump(info, f, indent=2)
            
        # 记录该论文已处理
        with open(processed_ids_file, "a") as f:
            f.write(f"{paper_id}\n")
            
        # 防止API调用过快
        time.sleep(0.5)
    
    # 汇总所有结果
    aggregate_results(output_dir)

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

    # 打印解析后的数据
    # for item in data:
    #     print(f"Title: {item['title']}")
    #     print(f"ID: {item['_id']}")
    #     print(f"Author: {item['author']}")
    #     print(f"Abstract: {item['abstract']}\n")

    #     pdb.set_trace()

# TODO 增加 systerm