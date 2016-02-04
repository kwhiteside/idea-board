var app = angular.module('issueBoard', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'mainCtrl',
      resolve: {
		    postPromise: ['issues', function(issues){
		      return issues.getAll();
		    }]
		  }
    })

    .state('issues', {
		  url: '/issues/{id}',
		  templateUrl: '/issues.html',
		  controller: 'issueCtrl'
		});

  $urlRouterProvider.otherwise('home');

}]);

app.factory('issues', ['$http', function($http){
  
  var o = {
    issues: []
  };
  
  o.getAll = function() {
    return $http.get('/issues').success(function(data){
      angular.copy(data, o.issues);
    });
  };

  return o;

}])

app.controller('mainCtrl', ['$scope','issues', function($scope, issues){

	$scope.issues = issues.issues;

	$scope.addIssue = function(){
		if(!$scope.title || $scope.title === '') { return; }
		else if (!$scope.department || $scope.department === '') { return; }
		else if (!$scope.description || $scope.description === '') { return; }
	  $scope.issues.push({
	  	title: $scope.title, 
	  	department: $scope.department, 
	  	description: $scope.description, 
	  	upvotes: 0,
	  	comments: [
		    {author: 'Joe', body: 'Cool post!', upvotes: 0},
		    {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
		  ]
	  });
	  $scope.title = '';
	  $scope.department = '';
	  $scope.description = '';
	};

	$scope.incrementUpvotes = function(issue) {
	  issue.upvotes += 1;
	};
	$scope.decrementUpvotes = function(issue) {
	  issue.upvotes -= 1;
	};

}]);

app.controller('issueCtrl', ['$scope','$stateParams','issues', function($scope, $stateParams, issues){
	
	$scope.issue = issues.issues[$stateParams.id];

	$scope.addComment = function(){
	  if($scope.body === '') { return; }
	  $scope.issue.comments.push({
	    body: $scope.body,
	    author: 'user',
	    upvotes: 0
	  });
	  $scope.body = '';
	};

}]);
