function ($scope, $location, $timeout, $element) {
	$scope.showFullInfoCollegues = false;
	$scope.showFullInfoReports = false;
	$scope.showMyProfile = false;
	$scope.$on('finishedChanged', function(event, data) {
      $scope.myManager = data.profile.manager;
      $scope.teamMembers = data.profile.members;
			$scope.directReports = data.profile.direct_reports;
			if(data.profile.user && data.profile.user.sys_id) { //if user exists, then this isn't 'my' profile. It's someone elses.
				$scope.showMyProfile = true;
				$scope.userID = data.profile.user.sys_id;
			}
	  if ($scope.data.show_current_user == 'false') {
		var filterByUserId = function(member) {
			return member.sys_id !== $scope.data.user_id;
		};
		$scope.teamMembers = $scope.teamMembers.filter(filterByUserId);
		$scope.directReports = $scope.directReports.filter(filterByUserId);
	  }
	});
	
	$scope.openProfile = function(user) {
		$location.search("id=user_profile&sys_id=" + user.sys_id); 
	};
	
	$scope.showTeamWidget = function() {
		return ($scope.myManager && $scope.myManager.sys_id) ||
			($scope.teamMembers && $scope.teamMembers.length > 1) ||
			($scope.directReports && $scope.directReports.length > 0);
	};

    $scope.updateList = function(variable, value) {
        if (variable == 'showFullInfoReports') {
            $scope.showFullInfoReports = value;
            $scope.focusOnNextMember(value, 'direct_reports');
        }
        else if (variable == 'showFullInfoCollegues') {
            $scope.showFullInfoCollegues = value;
            $scope.focusOnNextMember(value, 'colleagues');
        }
    };

    $scope.focusOnNextMember = function(value, category) {
        $timeout(function() {
            var categoryId = '#' + category;
            if (value)
                $element.find(categoryId + ' [tabindex=0]')[$scope.data.limitTo].focus();
            else
                $element.find(categoryId + ' .more_link').focus();
        });
    }

}
