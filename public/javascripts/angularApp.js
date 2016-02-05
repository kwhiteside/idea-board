var app = angular.module('issueBoard', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('home', {
      url: '/home',
      templateUrl: '../views/pages/home.html',
      controller: 'mainCtrl',
      resolve: {
		    postPromise: ['issues', function(issues){
		      return issues.getAll();
		    }]
		  }
    })

    .state('issues', {
		  url: '/issues/{id}',
		  templateUrl: '../views/pages/issues.html',
		  controller: 'issueCtrl',
		  resolve: {
		    issue: ['$stateParams', 'issues', function($stateParams, issues) {
		      return issues.get($stateParams.id);
		    }]
		  }
		});

  $urlRouterProvider.otherwise('home');

}]);

app.factory('issues', ['$http', function($http){
  
  var o = { issues: [] };

  o.getAll = function() {
    return $http.get('/issues').success(function(data){
      angular.copy(data, o.issues);
    });
  };

  o.create = function(issue) {
	  return $http.post('/issues', issue).success(function(data){
	    o.issues.push(data);
	  });
	};

	o.upvote = function(issue) {
	  return $http.put('/issues/' + issue._id + '/upvote')
	    .success(function(data){
	      issue.upvotes += 1;
	    });
	};

	o.get = function(id) {
	  return $http.get('/issues/' + id).then(function(res){
	    return res.data;
	  });
	};

	o.addComment = function(id, comment) {
	  return $http.post('/issues/' + id + '/comments', comment);
	};

	o.upvoteComment = function(issue, comment) {
	  return $http.put('/issues/' + issue._id + '/comments/'+ comment._id + '/upvote')
	    .success(function(data){
	      comment.upvotes += 1;
	    });
	};

  return o;

}])

app.controller('mainCtrl', [
	'$scope',
	'issues',
	function($scope, issues){

	$scope.issues = issues.issues;

	$scope.addIssue = function(){

		if      (!$scope.title || $scope.title === '') { return; }
		else if (!$scope.department || $scope.department === '') { return; }
		else if (!$scope.description || $scope.description === '') { return; }
		
		issues.create({
	    title: $scope.title,
	    department: $scope.department,
	    description: $scope.description,
	  });

	  $scope.title = '';
	  $scope.department = '';
	  $scope.description = '';

	};

	$scope.incrementUpvotes = function(issue) {
	  issues.upvote(issue);
	};

}]);

app.controller('issueCtrl', [
	'$scope',
	'issues',
	'issue', 
	function($scope, issues, issue){
	
		$scope.issue = issue;

		$scope.addComment = function(){

		  if($scope.body === '') { return; }
		  issues.addComment(issue._id, {
		    body: $scope.body,
		    author: 'user',
		  }).success(function(comment) {
		    $scope.issue.comments.push(comment);
		  });

		  $scope.body = '';

		};

		$scope.incrementCommentUpvotes = function(comment){
		  issues.upvoteComment(issue, comment);
		};

}]);
