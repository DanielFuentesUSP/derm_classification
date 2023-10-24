from flask import Flask
from flask import jsonify
import requests

url = 'http://127.0.0.1:5000/'
my_img = {'image': open('./image_214.jpg', 'rb')}
r = requests.post(url, files=my_img)

# convert server response into JSON format.
print(r.json())