var app = angular.module('emreOptIn', []);
app.controller('emreOptInCtrl', function($scope, $timeout, $window) {
    $scope.optInValue = "";
    $scope.handleJSONResponse = function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var parsedAns = JSON.parse(answer);
        if (parsedAns) {
            $scope.optInValue = parsedAns.active;
            $scope.$apply();
        }
        return;
    };
    $scope.handleResponse = function(response) {
        $window.location.reload();
    };
    $scope.uiModel = {
        agreement: $scope.optInValue
    };
    $scope.disableOptInButton = function() {
        return (!$scope.uiModel.agreement);
    };

    $scope.checkOptInCheckbox = function() {
        return $scope.optInValue;
    };

    $scope.showOptInFeature = function() {
        return $scope.optInValue;
    };
    $scope.showOptOutFeature = function() {
        return !$scope.optInValue;
    };

    $scope.optIn = function() {
        var ga = new GlideAjax('emreOptInAjax');
        ga.addParam('sysparm_name', 'optIn');
        ga.getXMLAnswer($scope.handleResponse);
    };
    $scope.optOut = function() {
        var ga = new GlideAjax('emreOptInAjax');
        ga.addParam('sysparm_name', 'optOut');
        ga.getXMLAnswer($scope.handleResponse);
    };
    var ga = new GlideAjax('emreOptInAjax');
    ga.addParam('sysparm_name', 'fetchOptInDetails');
    ga.getXML($scope.handleJSONResponse);
});
