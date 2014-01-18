var app = angular.module('TTNRelay', [
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap'
  ])

.config(function($routeProvider, $locationProvider){

    $routeProvider.when('/', {
      templateUrl: 'views/main.html',
      controller: 'AppCtrl'
    });

    $routeProvider.when('/tracker/:trackerId/thing/:thingId/version/:version', {
      templateUrl: 'views/thing/view.html',
      controller: 'ThingCtrl'
    });

    $locationProvider.html5Mode(false);

  })

.controller('AppCtrl', ['$scope', '$timeout', '$http', '$rootScope', function($scope, $timeout, $http, $rootScope) {

  $scope.trackers = {};
  $scope.thingsSummary = [];

  $rootScope.currentTrackerId = $rootScope.currentTrackerId|| undefined;

  $http.get('node.json').success(function(data) {
      $scope.trackers = data.trackers;
      if ($rootScope.currentTrackerId){
        $scope.showThings($scope.trackers[$rootScope.currentTrackerId]);
      }
  });

  $scope.showThings = function(tracker){

    $rootScope.currentTrackerId = tracker.id;

    $scope.thingsSummary.splice(0,$scope.thingsSummary.length);

    $http.get('tracker/'+tracker.id+'.json').success(function(data) {

      for (var i = 0; i < data.things.length; i++) {
        var thing = data.things[i];
        $scope.thingsSummary.push({
          trackerId: tracker.id,
          id: thing.id,
          title: thing.title,
          summary: thing.summary,
          latestVersion: thing.latestVersion,
          thumbnailURL: thing.thumbnailURL||undefined
        });
      };
    });
  };



}])
.controller('ThingCtrl', ['$scope', '$location', '$routeParams', '$http', function($scope, $location, $routeParams, $http) {
  $scope.thing;

  $scope.thingId = $routeParams.thingId;
  $scope.trackerId = $routeParams.trackerId;
  $scope.version = $routeParams.version;


  if ($scope.thingId === undefined){
    log.error("No Thing ID given.");
    $location.path( "/" );
  };

  if ($scope.trackerId === undefined){
    log.error("No Tracker ID given.");
    $location.path( "/" );
  };

  $http.get('tracker/'+$scope.trackerId+'/thing/'+$scope.thingId+'/version/'+$scope.version+'/thing.json').success(function(thing) {
    $scope.thing = thing;
  });

  $scope.downloadThing = function(thing){
    if (thing.downloadURL){
      window.open(thing.downloadURL);
    }
  };

}])
.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
})
.filter('nl2br', function () {
  return function(text){
    if (text == undefined){
      return undefined;
    }
    return text.replace(/\\n/g,'<br>');
  }
})
.filter('stripUrlProtocol', function () {
  return function(text){
    if (text == undefined){
      return undefined;
    }
    return text.replace(/^(?:(ht|f)tp(s?)\:\/\/)?/,'');
  }
})
.filter('truncate', function () {
  return function (text, length, end) {
    if (text == undefined){
      return undefined;
    }
    if (isNaN(length))
        length = 10;

    if (end === undefined)
        end = "...";

    if (text.length <= length || text.length - end.length <= length) {
        return text;
    }
    else {
        return String(text).substring(0, length-end.length) + end;
    }
  };
});