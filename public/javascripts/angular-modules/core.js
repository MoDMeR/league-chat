//init app
var app = angular.module('myApp', ['ui.router', 'ngAnimate', 'ui.bootstrap']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    //
    // For any unmatched url, redirect to /state1
    $locationProvider.html5Mode(true)
    $urlRouterProvider.otherwise("/home");
    //
    // Now set up the states
    //TODO dont user mainCtrl for other states
    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: "angular-partials/home.html",
            controller:'loginCtrl'
        })
        .state('chat', {
            url: "/chat",
            templateUrl:"angular-partials/chat.html",
            controller:'chatCtrl'
        })
});

app.service('socketService', function($http){
    return{
        env: {'path': undefined},
        getEnv: function(){
            return $http({
                method: 'GET',
                url: '/service/devservice',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
            })
                .success(function (data) {
                    //console.log('success')
                })
                .error(function (data) {
                    //console.log(data)
                    console.log('error');
                });
        },
        connection: function(env){
            console.log(env)
            if(env == '/Users/Patrick'){
                console.log('dev config', env)
                return io();
            }else{
                console.log('live config', env)
                return io("http://weblolchat2-weblolchat.rhcloud.com:8000");
            }
            //console.log(this.getEnv().success(function(data){return data}))
        }
    }
})

app.factory('friendList', function(){
    var svc = {};
    svc.online = [];

    svc.newPresence = function(friend) {
        switch(friend.online) {
            case true:
                var found = false;
                for(var i=0;i<svc.online.length;i++){
                    if(friend.name == svc.online[i].name){
                        found = true;
                        break;
                    }
                }
                if(found == false){
                    friend.messages = [];
                    friend.unread = 0;
                    jidEnd = friend.jid.indexOf('@')
                    shortId = friend.jid.slice(3, jidEnd)
                    friend.shortId = shortId
                    svc.online.push(friend);
                }
                break;
            case false:
                for(var i=0;i<svc.online.length;i++){
                    if(friend.name == svc.online[i].name){
                        svc.online.splice(i, 1)
                    }
                }
                break;
            default:
            console.log('unrecognized presence')
        }
        if(friend.online == true){

        }
    };
    svc.newMessage = function(newMsg) {
        var idEnd = newMsg.from.indexOf('@')
        var thisId = newMsg.from.slice(3, idEnd);
        //TODO use shortId
        for(var i=0;i<svc.online.length;i++){
            jidEnd = svc.online[i].jid.indexOf('@')
            thisJid = svc.online[i].jid.slice(3, jidEnd)
            if(thisId == thisJid){
                svc.online[i].messages.push(newMsg)
                svc.online[i].undread = svc.online[i].unread++
            }
        }
    }

    return svc;
})

app.controller('mainCtrl', ['$scope', '$http', 'socketService', function($scope, $http, socketService){

}]);

app.controller('loginCtrl',
    ['$scope', '$rootScope', '$http', 'socketService', '$state', 'friendList',
        function ($scope, $rootScope, $http, socketService, $state, friendList) {
            socketService.getEnv().success(function (data) {
                $scope.socket = socketService.connection(data.env)
            })
            //for production pass in param to io("http://weblolchat-weblolchat.rhcloud.com:8000")
            $scope.formData = {};
            $scope.formData.server = 'NA';

            $scope.login = function () {
                console.log('in login func')
                $scope.socket.emit('auth', $scope.formData);
            }

            $rootScope.onlineFriends = []

            $scope.$watch('socket', function (ov, nv) {
                console.log($scope.socket)
                if ($scope.socket) {
                    $scope.socket.on('online', function () {
                        console.log('online clientside event')
                        $state.go('chat')
                        $scope.$apply()
                    })
                    $scope.socket.on('roster', function (list) {
                        $scope.friends = list;
                        $scope.$apply()
                    })
                    $scope.socket.on('updatefriend', function (friend) {
                        friendList.newPresence(friend)
                        console.log(friend)
                        $rootScope.$broadcast('updateFriends');
                        $scope.$apply()
                    })
                    $scope.socket.on('message', function (message) {
                        $rootScope.$broadcast('newmessage', message);
                        $scope.$apply()
                    })
                    $scope.socket.on('clienterror', function (msg) {
                        console.log('caught it')
                        console.log(msg)
                        $scope.$apply()
                    })
                }
            })
}]);

app.controller('chatCtrl', ['$scope', '$rootScope', '$http', 'socketService', 'friendList', function($scope, $rootScope, $http, socketService, friendList){
    $scope.$on('updateFriends', function(){
        $scope.onlineFriends = friendList.online
        $scope.$apply()
    })
    $scope.$on('newmessage', function(evt, message){
        //TODO do this to message counter : http://stackoverflow.com/questions/275931/how-do-you-make-an-element-flash-in-jquery
        friendList.newMessage(message)
        $scope.$apply()
    })
    $scope.showMessages = function(shortId){
        for(var i=0;i<friendList.online.length;i++){
            if(shortId == friendList.online[i].shortId){
                $scope.currentMessages = friendList.online[i].messages
            }
        }
    }
}]);