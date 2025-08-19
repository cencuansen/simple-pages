import requests

# 发送GET请求
response = requests.get('http://localhost:50021/version')

# 打印响应状态码和内容
print(f"状态码: {response.status_code}")
print(f"响应内容: {response.text}")