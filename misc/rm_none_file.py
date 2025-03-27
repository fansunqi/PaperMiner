import os
import json

def is_empty_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
        return (data.get('code_links') == "None" and
                data.get('tasks') == ["None"] and
                data.get('datasets') == ["None"] and
                data.get('methods') == ["None"] and
                data.get('results') == ["None"])

def clean_empty_files(directory):
    deleted_files_count = 0
    total_files_count = 0

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.json'):
                total_files_count += 1
                file_path = os.path.join(root, file)
                if is_empty_file(file_path):
                    os.remove(file_path)
                    deleted_files_count += 1
                    print(f"Deleted: {file_path}")

    remaining_files_count = total_files_count - deleted_files_count
    print(f"Total files checked: {total_files_count}")
    print(f"Files deleted: {deleted_files_count}")
    print(f"Remaining files: {remaining_files_count}")

directory = 'outputs/meta'
clean_empty_files(directory)