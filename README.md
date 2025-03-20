激活环境：
```
python3 -m venv pm_env
source pm_env/bin/activate
```
提取信息：
```
python backend/extract.py
```
启动后端：
```
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

启动前端：
```
cd paper-mining
npm run dev

```