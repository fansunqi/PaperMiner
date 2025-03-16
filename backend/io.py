import json
import pdb

def read_json_lines_for_arxiv(file_path):
    data = []
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:    
                line = line[:-2]  # 去掉行尾的逗号与换行符
                data.append(json.loads(line))
    except FileNotFoundError:
        print(f"File not found: {file_path}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
    return data

def read_json_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            return data
    except FileNotFoundError:
        print(f"File not found: {file_path}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

def read_all_meta_data():
    arxiv_file_path_list = ['meta_data/arxiv.json', 'meta_data/arxiv2.json']
    json_file_path_list = ['meta_data/CCF.json', 'meta_data/CCF2.json', 'meta_data/SCI.json', 'meta_data/SCI2.json']

    data = []
    for file_path in arxiv_file_path_list:
        data += read_json_lines_for_arxiv(file_path)
    for file_path in json_file_path_list:
        data += read_json_file(file_path)
    return data

if __name__ == '__main__':
    data = read_all_meta_data()

    print(f"Total number of papers: {len(data)}")

    # 打印解析后的数据
    for item in data:
        print(f"Title: {item['title']}")
        print(f"ID: {item['_id']}")
        print(f"Author: {item['author']}")
        print(f"Abstract: {item['abstract']}\n")

        pdb.set_trace()