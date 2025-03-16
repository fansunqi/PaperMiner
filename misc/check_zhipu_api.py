from zhipuai import ZhipuAI
client = ZhipuAI(api_key="586b36330a8d459fbd4cae2459a1da29.OFoMugBBw7H2RA7M")  # 请填写您自己的APIKey
response = client.chat.completions.create(
    model="glm-4-plus",  # 请填写您要调用的模型名称
    messages=[
        {"role": "user", "content": "作为一名营销专家，请为我的产品创作一个吸引人的口号"},
        {"role": "assistant", "content": "当然，要创作一个吸引人的口号，请告诉我一些关于您产品的信息"},
        {"role": "user", "content": "智谱AI开放平台"},
        {"role": "assistant", "content": "点燃未来，智谱AI绘制无限，让创新触手可及！"},
        {"role": "user", "content": "创作一个更精准且吸引人的口号"}
    ],
)
print("A")
print(response.choices[0].message.content)