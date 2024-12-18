import os

from flask import Flask, jsonify
#from . import db

app = Flask(__name__)

app.config.from_mapping(
    DATABASE=os.path.join(app.instance_path, 'tourdeflask.sqlite'),
)

# ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

#db.init_app(app)


@app.route('/')
def hello_world():  # put application's code here
    return "Hello TdA"

@app.route('/api')
def return_json():
    data = {"organization": "Student Cyber Games"}
    return jsonify(data)

if __name__ == '__main__':
    app.run()
