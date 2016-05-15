#League Chat [http://league.chat](http://league.chat)
##### a stand-alone implementation of the League of Legends chat client for browsers and desktop.
###### (for a better look at the server side implemenation checkout my other repo [server-lol-chat](https://github.com/trickpattyFH20/server-lol-chat))
![League Chat Home Page](http://league.chat/images/screenshots/login.png)

#### basic instructions for setting up local project:

1. `$ git clone https://github.com/trickpattyFH20/league-chat.git`  
2. `$ cd league-chat`  
3. `$ npm install`  

##### OSX
`$ ./start` (starts local server, navigate to http://127.0.0.1:8080 in your browser)    
`$ ./stop` (stops local server)    

##### Windows
`$ forever start -a bin/www` (starts local server, navigate to http://127.0.0.1:8080 in your browser)  
`$ forever stop bin/www` (stops local server)  
