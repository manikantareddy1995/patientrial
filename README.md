## Prerequisite 
* Node.js

## Instructions for setup Bot:- 
  * Clone the repository

  * Make a copy of .env.example file, named it .env

  * Change the 'ROCKET_CHAT_URL','BOT_USER_NAME','BOT_USER_PASSWORD' to your specific rocketchat url, rocketchat bot username, and rocketchat bot password in .env file respectively.

  * Change the 'USERNAME_FOR_API_ACCESS', 'PASSWORD_FOR_API_ACCESS' to the username and password respectively for accessing API.


  * Load your environment variables from .env as
    ```
    source .env
    ```

  * Then run the bot
    ```
    bin/hubot
    ```