angular.module('starter.services', [])

.factory('DataService', ['$http', '$log', 'localstorage', function($http, $log, localstorage) {
  return {
    sync: function () {
      $http.defaults.useXDomain = true;

      $http.get("http://friendshipbench-staging.cbits.northwestern.edu/api/users")
      
      .success(function (data){
        _.each(data, function (user) {
          localstorage.setObject("users", user);
        });
        alert("sync successful");    
      })
      
      .error(function (err){
        alert("error -- sync failed");
      });
    }
  }
}])

.factory('localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

.factory('AuthService', function (localstorage, Session) {
  var authService = {};
 
  authService.login = function (credentials) {
    var users = localstorage.getObject('users');
    var user = _.first(_.where(users, {pin: credentials.pin}));
    if(!!user.pin) {
      Session.create(user.username, user.guid, user.role);
    }
    return user;
  };
 
  authService.isAuthenticated = function () {
    return !!Session.userId;
  };
 
  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };
 
  return authService;
})

.service('Session', function () {
  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;
  };
  return this;
})

.factory('AuthInterceptor', function ($rootScope, $q,
                                      AUTH_EVENTS) {
  return {
    responseError: function (response) { 
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized,
        419: AUTH_EVENTS.sessionTimeout,
        440: AUTH_EVENTS.sessionTimeout
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.directive('loginDialog', function (AUTH_EVENTS) {
  return {
    restrict: 'A',
    template: '<div ng-if="visible" ng-include="\'login.html\'">',
    link: function (scope) {
      var showDialog = function () {
        scope.visible = true;
      };
  
      scope.visible = false;
      scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
      scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
    }
  };
});
