# Secure Line Messenger Bot

## Overview

the app provides a backend capability to send multiple chat messages to specific group and user. The process can be automated via cron-job for specified time cycle.

## Features

- **Automated Messaging**: Send messages at scheduled times.
- **Secure Communication**: Use secure methods for message delivery.
- **REST API Integration**: Interface with the bot through a REST API.
- **User and Group Chat Targeting**: Send messages to specific users or group chats using their IDs.

## Prerequisites

- **Line Messaging API**: basic username and password for accessing the bot.
- **Cron Jobs**: Familiarity with setting up cron jobs for scheduling tasks.
- **Group ID / User ID**: Having the IDs necessary for targeted message.

## Setup Instructions

1. **Ask the creator directly for username and password**
2. **Get UserID and or GroupID**
3. **Create cron-job with specified payload**

   -http authentication: username, password.
   -header: x-vercel-scheduler: true
   -body:{"dest-id": "xxxxx","messages":["message1","message2"]}
