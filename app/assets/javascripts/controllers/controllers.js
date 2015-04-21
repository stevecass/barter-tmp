angular.module('barter')
  .controller('WelcomeController', ['$routeParams', "UserService", "TalentService", function($routeParams, UserService, TalentService ){
    this.tals = [];
    this.persons = [];
    this.selectedCategory = 'Art & Music';

     UserService.query(function(data) {
      this.persons = data;
     }.bind(this));

     TalentService.query(function(data) {
      this.tals = data;
     }.bind(this));

     this.filterFunction = function(array, key){
       for(var i = 0; i < array.length; i++){
         if (array[i].type === key){
           return true
         }
       };
      return false;
     };

     // var rep = function(persons) {
     //  for(var i = 0; i < persons.length; i++){
     //    persons[i].reputation =
     //  }
     // };
     this.myVar = false;
     this.toggle = function() {
        this.myVar = true;
     };
     this.clear = function() {
        this.myVar = false;
     };



}]);
angular.module('barter')
.controller('UsersController', ['$http', '$routeParams', 'UserService', "TalentService", "OfferService", function($http, $routeParams, UserService, TalentService, OfferService){

  this.categories = ["Art & Music", "Sports", "Fitness & Nutrition", "Cooking & Baking", "Computers & Electronics", "Education & Careers", "Home Improvement"];
  this.hours = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"]
  this.days = ["Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday", "Sunday"]
  this.experiences = ["Novice", "Intermediate", "Expert"];
  this.ratings = [1, 2, 3, 4, 5];

  this.loadUserGraph = function() {
     UserService.get({id: $routeParams.id}, function(data){
       this.user = data;
       this.talent = {user_id: this.user.id}
       this.user.reputation = {user_id: this.user.id};
     }.bind(this));
   }

   this.loadUserGraph();

  this.saveUser = function(user) {
    UserService.update(user);
  };

  this.updateTalent = function(talent) {
    var that = this;
    $http.put('/talents/' + talent.id, talent)
    .success(function(response){
      that.loadUserGraph();
    });
  };


  this.saveRating = function(){
    $http.post('/reputations', this.user.reputation);
    this.loadUserGraph();
  };

/*
{"AWSAccessKeyId":"AKIAJP6TZ7GN2L25IVZA",
"key":"uploads/a48bc720-64fa-40d7-9ad0-a7d51aeff700/${filename}",
"policy":"eyJleHBpcmF0aW9uIjoiMjAxNS0wNC0yMVQyMTo1OTowMloiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiIifSxbInN0YXJ0cy13aXRoIiwiJGtleSIsInVwbG9hZHMvYTQ4YmM3MjAtNjRmYS00MGQ3LTlhZDAtYTdkNTFhZWZmNzAwLyJdLHsic3VjY2Vzc19hY3Rpb25fc3RhdHVzIjoiMjAxIn0seyJhY2wiOiJwdWJsaWMtcmVhZCJ9XX0=",
"signature":"xU4ObcO67jSLGrf7gOPXEuM4UX4=",
"success_action_status":"201",
"acl":"public-read"}
*/

  this.saveTalent = function(){
    var fd = new FormData();
    for (var k in this.s3Parameters) {
      fd.append(k, this.s3Parameters[k]);
    }

    fd.append('file', this.upload_file_entered);
    $http.post('https://barter-upload.s3.amazonaws.com/', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function(data){
         console.log(data);
      //$http.post('/talents', this.talent);
      //this.loadUserGraph();

    }.bind(this));
  };

  this.deleteTalent = function(talent) {
    var that = this;
    $http.delete('/talents/' + talent.id, talent)
    .success(function(response){
       that.loadUserGraph();
    });
  }

  this.toggleTalentShown = function(talent) {
    talent.isShown = ! talent.isShown;
  };

  this.loadTalentsForUser = function(user) {
    $http.get('/talents/for_user/' + user.id).
     success(function(data, status, headers, config) {
      this.talents = data;
    });
  };

  this.acceptOffer = function(offer) {
    var that = this;
    offer.status = true;
    $http.put('/offers/' + offer.id, offer)
    .success(function(data, status){
      that.loadUserGraph();
    });
  };

  this.declineOffer = function(offer) {
    var that = this;
    $http.delete('/offers/' + offer.id, offer)
    .success(function(response){
      that.loadUserGraph();
    }).error(function(response){
    });
  };

  function insertOffer(newOffer, user) {
    var slots = user.timeslots;
    slots.forEach(function(slot) {
      if (slot.id === newOffer.timeslot_id) {
        slot.offers.push(newOffer);
      }
    })
  }

  function removeOffer(offer, user) {
    var slots = user.timeslots;
    slots.forEach(function(slot) {
      if (slot.id === offer.timeslot_id) {
        var index = slot.offers.indexOf(offer);
        if (index > -1) {
            slot.offers.splice(index, 1);
        }
      }
    });
  }

  this.deleteTimeslot = function(timeslot) {
    var that = this;
    var offers = timeslot.offers;
      for (var i = 0; i < timeslot.offers.length; i ++) {
        this.declineOffer(timeslot.offers[i]);
      }
    $http.delete('/timeslots/' + timeslot.id, timeslot)
    .success(function(response){
       that.loadUserGraph();
    });
  }

  this.createTimeslot = function(day, hour) {
    var that = this;
    var dayHour = {
      day: day,
      hour: hour
    };
    console.log(dayHour);
    $http.post('/timeslots', dayHour)
    .success(function(response){
      console.log("in success");
      console.log(response);
       that.loadUserGraph();
    }).error(function(response){
      console.log("in error");
    });
  }

  this.creeTimeslot = function(day) {
    var dayHour = {
      day: this.user.timeslot.day,
      hour: this.user.timeslot.hour
    }
    var that = this;
    $http.post("/timeslots", dayHour)
    .success(function(response){
      console.log("in success!");
      that.loadUserGraph();
    }).error(function(response){
      console.log("in error!");
    });
  }


  this.createOffer = function(timeslot) {
    var that = this;
    $http.post('/offers', timeslot)
    .success(function(response){
      var newOffer = response;
      that.loadUserGraph();
    }).error(function(response){
      console.log("not in success but getting there!!!");
    });
  };

  this.isClosed = function(timeslot) {
     for( var i = 0; i < timeslot.offers.length; i++) {
        if (timeslot.offers[i].status === true) {
          return true;
        }
     }
  };

  this.hasOffer = function(timeslot,curusid) {
    for (var i = 0; i < timeslot.offers.length; i++){
      if (timeslot.offers[i].student.id == curusid) {
         return true;
         console.log("not found yet");
      };
    }
  };

  this.getS3UploadParams = function() {
    $http.get('/talent_forms/new').success(function(data){
      this.s3Parameters = data;
      console.log('s3data', data);
    }.bind(this));
  }


}])
// .directive('weekDay', function(){
//   return {
//     restrict: 'E',
//     scope: {
//       winfo : '=info'
//     },
//     templateUrl : 'wday-iso.html'
//   }
// });




angular.module('barter').controller('TimeslotsController', ['UserService', function(UserService){

   UserService.get({id:4}, function(jsonResponse) {
     this.user = jsonResponse;
   }.bind(this));
}]);
