api.controller = function($rootScope, $scope, spModal, $http, $window, $timeout) {
    /* widget controller */
    var c = this;
	$scope.showAvatarIcon = true;
	$scope.collapse = function() {
		$rootScope.$emit('sp-navbar-collapse');
	}
	
	var xsScreenSize = isXSScreenSize();
	$scope.showXSAvatar = isXSScreenSize()&& c.options.show_xs_avatar;
	$scope.showAvatar = !isXSScreenSize();
	$scope.profile_url = c.options.profile_url || "?id=user_profile&sys_id="+$scope.user.sys_id;
	
	function isXSScreenSize() {
		return $window.matchMedia('(max-width: 767px)').matches;
	}
	
	angular.element($window).on('resize', function () {
		if(xsScreenSize !== isXSScreenSize()){
			if(!$scope.showXSAvatar && c.options.show_xs_avatar)
				$scope.showXSAvatar = true;
			if(!$scope.showAvatar)
				$scope.showAvatar = true;
		}
	});

	$scope.removeTooltip = function() {
		$('.toggle-dropdown').tooltip('hide');
	};
	
	$rootScope.$on('sp.avatar_changed', function(evt, obj) {
		$scope.userID = "";
		$scope.newAvatarId = obj.newAvatarId;
	    	$scope.showAvatarIcon = false;
		$timeout(function(){
			$scope.userID = $scope.user.sys_id;
	    		$scope.showAvatarIcon = true;
		});
	});

    $scope.impersonate = function() {
        spModal.open({
            title: c.data.modalTitle,
            widget: 'impersonate-user',
            scope: scope,
			buttons:[]
        })
    };
	$scope.endImpersonate = function() {
		var userName = c.data.realUser;
        //If we don't have a user we can't impersonate
        if (!userName) {
            return;
        }
        //Call to the impersonation api with username/sys_id
        $http.post("/api/now/ui/impersonate/" + userName, {}).success(function() {
            $scope.showError = false;
            $window.location.href = $scope.portal.url_suffix;
        }).error(function(response) {
            if (response.error) {
                $scope.showError = true;
                $scope.error = response.error;
            }
        });
    };

};
