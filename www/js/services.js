angular.module('starter.services', [])

.service('lastSync', ['localstorage', function(localstorage){
  this.update = function () {
    var now = new Date();
    localstorage.set("lastSync", now);
    console.log("lastSync updated");
  };
  return this;
}])

.factory('DataService', ['$http', 'localstorage', 'lastSync', function($http, localstorage, lastSync) {
  return {
    
    syncUsers: function () {

      $http.get("https://friendshipbench-staging.cbits.northwestern.edu/api/users")
      
      .success(function (data){
        _.each(data.users, function (user) {
            p.save("users", user);
        });
        
        lastSync.update();

        alert("user sync successful");    
      })
      .error(function (err){
        alert("error -- user sync failed");
      });
    },
    
    syncData: function() {

      function importPatients(patients) {
        $http.get("http://localhost:3000/api/participants")
        
        .success(function (data){
          p.nuke("participants");
          _.each(data.participants, function (patient) {
            p.save("participants", patient);
          })
        })
        .error(function (data){
          alert("patient import failed")
        });
      };
      
      function exportPatients(patients) {
        $http({
          url: "http://localhost:3000/api/participants",
          method: "POST",
          data: {"participants": patients},
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
         })
        .success(function (){
          importPatients(patients);
          alert("patient export successful");    
        })
        .error(function (err){
          alert("error -- patient sync failed");
        });
      };

      var participants = p.find("participants") || null;
      
      if(participants.length > 0){
        exportPatients(participants);
        lastSync.update();
      }
      else {
        importPatients(participants);
        lastSync.update();
      }
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
    var user = _.first(p.find('users', {pin: credentials.pin}));
    if(!!user) {
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

.service('Session', function (localstorage) {
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

.service('GuidMaker', function(){
    this.s4 = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
    };
    this.guid = function() {
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
               this.s4() + '-' + this.s4() + this.s4() + this.s4();
    };
    return this;
})
