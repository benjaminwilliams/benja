'use strict';

var blogApp = angular.module('blogApp', [
    'ngRoute'
]);

blogApp.config(function($routeProvider, $locationProvider) {

    $routeProvider.
        when('/blog', {
            templateUrl: 'partials/blog.html'
        }).
        when('/post', {
            templateUrl: 'partials/post.html',
            controller: 'blogPostCtrl'
        }).
        when('/:postId', {
            templateUrl: 'partials/post.html',
            controller: 'blogPostCtrl'
        }).
        otherwise({
            redirectTo: '/blog'
        });

    $locationProvider.html5Mode(true);

});



//Controller
blogApp.controller('appCtrl', function($scope, $routeParams, blogService) {

    //init
    $scope.index = []; //array that will contain the location of all the files we need
    $scope.posts = []; //array that will be filled by the blogService

    $scope.blogOrderOption = "dateCreated";

    // retrieve the data from the service
     function getData() {
        blogService.getIndexData().then(
            function(data) {
                $scope.index = data;

                // Now we have the list of files
                // We can retrieve each file and add it to $scope.data
                for(var i = 0; i < $scope.index.posts.length; i++){ //for each item in the index
                    blogService.getData($scope.index.posts[i]).then( //call the getData service
                        function(data){

                            $scope.posts.push({
                                "title" : data.title,
                                "dateCreated" : data.date,
                                "name" : data.name,
                                "author" : data.author,
                                "content" : data.content,
                                "tags" : data.tags
                            });

                        },
                        function(err){
                            console.log("error getting file with id: " + i);
                        }
                    )
                }

            },
            function() {
                console.log("error getting index file");
            });
     }


    getData();
});

blogApp.controller('blogPostCtrl', function($scope, $routeParams, blogService) {

    $scope.currentPost = "";

    function getCurrentPost() {

        var post = $routeParams.postId;
        console.log(post);

        blogService.getData(post).then( //call the getData service
            function (data) {
                $scope.currentPost = data;
                //$scope.posts.push({
                //    "title" : data.title,
                //    "dateCreated" : data.date,
                //    "name" : data.name,
                //    "author" : data.author,
                //    "content" : data.content,
                //    "tags" : data.tags
                //});
            },
            function (err) {
                console.log("error getting file with id: " + post);
            }
        )
    }

    getCurrentPost();

    //$scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function (phone) {
    //    $scope.mainImageUrl = phone.images[0];
    //});
    //
    //$scope.setImage = function (imageUrl) {
    //    $scope.mainImageUrl = imageUrl;
    //};
});


//Service
blogApp.factory('blogService', function($http, $q) {
    return {
        /**
         * Gets the index.json file that contains the location of each post's JSON file
         * @returns {*} contents of index.json
         */
        getIndexData: function() {
            var deferred = $q.defer();
            $http.get('data/index.json')
                .success(function(data) {
                    deferred.resolve(data);
                }).error(function(msg, code) {
                    deferred.reject(msg);
                    console.log("error: " + msg);
                });
            return deferred.promise;
        },

        /**
         * Returns the JSON for a specified id
         * @param id name of the file, including .json file extension
         * @returns {*} contents of the requested JSON file
         */
        getData: function(id) {

            var deferred = $q.defer();
            $http.get('data/' + id + '/blog.json')
                .success(function(data) {
                    deferred.resolve(data);
                }).error(function(msg, code) {
                    deferred.reject(msg);
                    console.log("error: " + msg);
                });
            return deferred.promise;
        }
    }
});
