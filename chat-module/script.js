angular.module('chatApp', [])
    .controller('ChatController', ['$scope', '$http', '$window', '$timeout', function($scope, $http, $window, $timeout) {
        var params = {};
        var queryString = $window.location.search;
        var query = queryString.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }

        $scope.doctor = {
            name: params.doctor,
            city: params.city,
            description: params.description
        };
        $scope.messages = [];
        $scope.userMessage = '';

        $timeout(function() {
            if ($scope.doctor.name) {
                $scope.messages.push({ role: 'assistant', content: $scope.doctor.name + " joined the conversation. Say hi!" });
            } else {
                $scope.messages.push({ role: 'assistant', content: "Welcome to the chat. How can I help you today?" });
            }
        }, 20);

        $scope.sendMessage = function() {
            if ($scope.userMessage.trim() !== '') {
                $scope.messages.push({ role: 'user', content: $scope.userMessage });
                
                $http.post('http://localhost:3000/doctorchat', { 
                    content: $scope.userMessage
                }, {
                    params: {
                        doctor: $scope.doctor.name,
                        city: $scope.doctor.city,
                        description: $scope.doctor.description
                    }
                }).then(function(response) {
                    $scope.messages.push({ role: 'assistant', content: response.data.reply });
                    $scope.userMessage = '';
                    scrollToBottom();
                });
            }
        };

        $scope.closeChat = function() {
            window.close();
        };

        function scrollToBottom() {
            var chatMessages = document.getElementById('chatMessages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }]);