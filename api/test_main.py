from main import app
import unittest

def test_hello():
    response = app.test_client().get('/')

    assert response.status_code == 200
    assert response.data == b'Hello, World!'

def test_cat():
    response = app.test_client().get('/cat')

    assert response.status_code == 200
    assert b"https://cataas.com/cat/says/" in response.data 

if __name__ == '__main__':
    unittest.main(verbosity=2)