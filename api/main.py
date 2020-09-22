import urllib.parse

from faker import Faker
from flask import Flask
from flask_cors import CORS
import requests


app = Flask(__name__)
CORS(app)

fake = Faker()

@app.route('/', methods=['GET', 'POST'])
def hello_world():
    return 'Hello, World!'
    
@app.route('/cat', methods=['GET', 'POST'])
def get_cat():
    name = urllib.parse.quote(fake.catch_phrase())
    url = F"https://cataas.com/cat/says/{name}?color={fake.safe_color_name()}"
    return url

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))