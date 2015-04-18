angular.module('barter')
  .controller('WelcomeController', ['$routeParams', "TalentService", 'UserService', function($routeParams, TalentService, UserService){
    this.tals = [];
    this.author = {};
    this.selectedCategory = 'Music';

     TalentService.query(function(data) {
      this.tals = data;
      console.log("response", data);
     }.bind(this));

     UserService.get({id: $routeParams.id}, function(data) {
       this.author = data;
     }.bind(this));
}]);

angular.module('barter')
.controller('UsersController', ['$routeParams', 'UserService', function($routeParams, UserService, TalentService){
    UserService.get({id: $routeParams.id}, function(data){
      this.user = data;
    }.bind(this));
}]);


angular.module('barter').controller('TimeslotsController', ['UserService', function(UserService){
   // here you'd put code to e.g.
   // load the timeslots from a service, handle form subsmissions etc
   console.log('TimeslotsController instantiated');
   this.slots = [ "a", "b", "c", "d" ]

   UserService.get({id:4}, function(jsonResponse) {
     this.user = jsonResponse;
     console.log('response', jsonResponse);
   }.bind(this));
}]);
