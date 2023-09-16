import json
import requests

LINE_CHANNEL_ID = "2000778950"
LINE_CHANNEL_SECRET = "56b0fd26c73d11b1d92a56f9a16707d8"
LINE_ACCESS_TOKEN = "YO8hmjXdzmiEjW/bjXupqRTSM1HfQ4enoT4W9uCn56KDCgGp/zToQm0mb7DCwj0K8NSWoeHXoWS5xKeuLdv32hTns+KnzRTnnzlepnsF4ZT2fhEURnL5JvvufWhAi3opoCGvTU5XeDCobxfpsBcAwgdB04t89/1O/w1cDnyilFU="

def webhook(request):
  # Get the JSON payload from the request.
  payload = json.loads(request.body)

  # Get the user ID of the person to tag.
  tagged_user_id = payload["events"][0]["source"]["userId"]

  # Get the message to send.
  message = f"Hey <@Jansen W Baru>, Kerjain Genshinnya anjing!"

  # Send the message to the group.
  requests.post(
    "https://api.line.me/v2/bot/message/push",
    headers={
      "Authorization": "Bearer {}".format(LINE_ACCESS_TOKEN)
    },
    json={
      "to": payload["events"][0]["source"]["groupId"],
      "messages": [
        {
          "type": "text",
          "text": message
        }
      ]
    }
  )

  # Return a response.
  return json.dumps({
    "message": "Webhook processed successfully."
  })
