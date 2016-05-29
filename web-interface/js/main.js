
var settings = {};
var tempFGauge = {};
var humGauge = {};
var app = angular.module('myApp', []);

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }]);

  app.controller('readingCtrl', function($scope, $http, $interval) {
    $scope.getReading = (function(){

      $scope.Res =$http.get('/api/reading').then(function successCallback(response) {
          //var d = response.data.hits.hits[0]._source;
          var t = response.data.timestamp;
          $scope.timestamp = new Date(t);
	  //$scope.timestamp.setMilliseconds(t);
          $scope.timestamp.setTime( $scope.timestamp.getTime());
	  $scope.timestamp = $scope.timestamp.toString();
          $scope.stamp = t;
          $scope.tempF = response.data.fahrenheit;
          $scope.tempC = response.data.celsius;
          $scope.hum = response.data.humidity;
          tempFGauge.refresh($scope.tempF);
          humGauge.refresh($scope.hum);
          if(response.data.closed == 1){
            $scope.openclose = 'CLOSED';
          }
          else {
              $scope.openclose = 'OPEN';
          }
        }, function errorCallback(response) {  });
    });

     $scope.getSettings = (function(){
       $http.get('/settings.json').then(function successCallback(response) {
          settings = response.data;
          console.log(JSON.stringify(settings));

            humGauge = new JustGage({
              id: "Humidity",
              value: 0,
              min: 35,
              max: 100,
              decimals:2,
              customSectors: [{
                color : "#ff0000"
                , lo : 0
                , hi : settings.humidityAlertTooLow
              },
              {
                color : "#ffff00"
                , lo : settings.humidityAlertTooLow
                , hi : settings.humidityWarnTooLow
              },
              {
                color : "#00ff00"
                , lo : settings.humidityWarnTooLow
                , hi : settings.humidityWarnTooHigh
              },
              {
                color : "#0000ff"
                , lo : settings.humidityWarnTooHigh
                , hi : settings.humidityAlertTooHigh
              },
              {
                color : "#ff0000"
                , lo : settings.humidityAlertTooHigh
                , hi : 999
              }
            ],
              title: "Humidity"
              , label: "percent"

            });

          tempFGauge = new JustGage({
                id: "TemperatureF",
                value: 0,
                min: 45,
                max: 90,
                decimals:2,
                customSectors: [{
                  color : "#ff0000"
                  , lo : 0
                  , hi : settings.tempAlertTooLow
                },
                {
                  color : "#ffff00"
                  , lo : settings.tempAlertTooLow
                  , hi : settings.tempWarnTooLow
                },
                {
                  color : "#00ff00"
                  , lo : settings.tempWarnTooLow
                  , hi : settings.tempWarnTooHigh
                },
                {
                  color : "#ffff00"
                  , lo : settings.tempWarnTooHigh
                  , hi : settings.tempAlertTooHigh
                },
                {
                  color : "#ff0000"
                  , lo : settings.tempAlertTooHigh
                  , hi : 9999
                }
              ],
                title: "Temperature(F)"
              , label: "degrees fahrenheit"});
        }
          , function errorCallback(response){});
     })
     $scope.getSettings();

    $scope.getReading();
    var timer=$interval(function(){
        $scope.getReading();
    },1000);
  });
