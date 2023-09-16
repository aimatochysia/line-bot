import json
import requests

def webhook(request):
  # Get the JSON payload from the request.
  payload = json.loads(request.body)

  # Get the user ID of the person to tag.
  tagged_user_id = payload["events"][0]["source"]["userId"]

  # Get the message to send.
  message = f"Hey <@{tagged_user_id}>, this is your daily reminder!"

  # Send the message to the group.
  requests.post(
    "https://api.line.me/v2/bot/message/push",
    headers={
      "Authorization": "Bearer YO8hmjXdzmiEjW/bjXupqRTSM1HfQ4enoT4W9uCn56KDCgGp/zToQm0mb7DCwj0K8NSWoeHXoWS5xKeuLdv32hTns+KnzRTnnzlepnsF4ZT2fhEURnL5JvvufWhAi3opoCGvTU5XeDCobxfpsBcAwgdB04t89/1O/w1cDnyilFU="
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
