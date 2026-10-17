var app = angular.module('employeeProfileOptIn', []);
app.controller('epOptInCtrl', function($scope, $timeout, $window) {
    $scope.optInValue = "";
    $scope.empDefPresent = "";
    $scope.isNewOrgChartExist = "";

    $scope.handleJSONResponse = function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var parsedAns = JSON.parse(answer);
        if(parsedAns) {
        $scope.optInValue = parsedAns.empProfileOpted;
        $scope.empDefPresent = parsedAns.empDefPresent;
        $scope.isNewOrgChartExist = parsedAns.isNewOrgChartExist;
        $scope.optedOut = !$scope.empDefPresent;
        $scope.$apply();
		}
        return;
    };
    $scope.handleResponse = function(response) {
        $window.location = window.location.href;
    };
    $scope.uiModel = {
        agreement: $scope.optInValue
    };
    $scope.disableOptInButton = function() {
        return ((!$scope.uiModel.agreement) || (!$scope.empDefPresent));
    };
    $scope.disableOptInCheckbox = function() {
        return (!$scope.empDefPresent);
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
        var ga = new GlideAjax('ep_employeeProfileOptInAjax');
        ga.addParam('sysparm_name', 'optIn');
        ga.getXMLAnswer($scope.handleResponse);
    };
    $scope.optOut = function() {
        var ga = new GlideAjax('ep_employeeProfileOptInAjax');
        ga.addParam('sysparm_name', 'optOut');
        ga.getXMLAnswer($scope.handleResponse);
    };
    var ga = new GlideAjax('ep_employeeProfileOptInAjax');
    ga.addParam('sysparm_name', 'fetchOptInDetails');
    ga.getXML($scope.handleJSONResponse);
});
