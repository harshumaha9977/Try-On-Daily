import requests

url = "http://127.0.0.1:8000/tryon"
files = {
    'user_image': open('backend/user.jpg', 'rb'),
    'cloth_image': open('backend/cloth.jpg', 'rb')
}
response = requests.post(url, files=files)
if response.status_code == 200:
    with open('backend/output.jpg', 'wb') as f:
        f.write(response.content)
    print("Success")
else:
    print("Error:", response.status_code, response.text)
