import os
from flask import Flask, request, abort
from linebot import LineBotApi, WebhookHandler
from linebot.models import MessageEvent, TextSendMessage

app = Flask(__name__)

# Replace these with your LINE bot credentials
LINE_CHANNEL_ACCESS_TOKEN = 'YO8hmjXdzmiEjW/bjXupqRTSM1HfQ4enoT4W9uCn56KDCgGp/zToQm0mb7DCwj0K8NSWoeHXoWS5xKeuLdv32hTns+KnzRTnnzlepnsF4ZT2fhEURnL5JvvufWhAi3opoCGvTU5XeDCobxfpsBcAwgdB04t89/1O/w1cDnyilFU='
LINE_CHANNEL_SECRET = '56b0fd26c73d11b1d92a56f9a16707d8'

line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)

# Replace with the user ID or display name of "Jansen W Baru"
TARGET_USER = "Jansen W Baru"

@app.route("/callback", methods=['POST'])
def callback():
    signature = request.headers['X-Line-Signature']
    body = request.get_data(as_text=True)
    try:
        handler.handle(body, signature)
    except Exception as e:
        print(e)
        abort(400)
    return 'OK'

@handler.add(MessageEvent, message=None)
def handle_message(event):
    if event.source.type == 'group':
        group_id = event.source.group_id
        user_id = event.source.user_id
        message_text = event.message.text

        # Check if the message is from the correct group and sender
        if message_text.lower() == 'send daily message' and user_id == TARGET_USER:
            # Replace with your daily message content
            daily_message = "This is your daily message."

            # Send the message back to the group
            line_bot_api.push_message(group_id, TextSendMessage(text=daily_message))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
