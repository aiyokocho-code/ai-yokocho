import os
from flask import Flask
from flask_sock import Sock

app = Flask(__name__)
sock = Sock(app)

@sock.route('/ws')
def echo(ws):
    while True:
        data = ws.receive()
        if data:
            ws.send(f"AI横丁へようこそ！受信メッセージ: {data}")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
# retry-1771423710
