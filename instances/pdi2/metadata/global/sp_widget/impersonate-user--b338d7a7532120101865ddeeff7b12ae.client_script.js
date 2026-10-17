api.controller = function($scope, $http, $window) {
    /* widget controller */
    var c = this;
	c.data.toImpersonate = {};

    $scope.impersonate = function(userName) {
        //If we don't have a user we can't impersonate
        if (!userName)
            return;
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

	//call to the impersonation api Get recent impersonations
	$scope.getRecentImpersonation = function() {
		$http.get("/api/now/ui/impersonate/recent", {}).success(function(response) {
			$scope.showError = false;
			$scope.recentImpersonations=response.result;
			if(Object.keys($scope.recentImpersonations).length === 0) {
				popoverFocusTrap();
			}						
		}).error(function(response) {
			if (response.error) {
				$scope.showError = true;
				$scope.error = response.error;
			}
		});
	};
	
	function popoverFocusTrap() {
		var modalContent = document.querySelector('input[id^="s2id_autogen"]');
		var modalHeader = document.getElementsByClassName('modal-header');
		if(modalContent && modalHeader && modalHeader.length>0) {
			var closeButton = modalHeader[0].firstElementChild;
			modalContent.addEventListener('keydown', function(e) {
				var KEYCODE_TAB = 9;
				var isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);
				if (!isTabPressed) {
					return;
				}
				if (e.shiftKey) /* shift + tab */ {
					if (document.activeElement === closeButton) {
						modalContent.focus();
						e.preventDefault();
					}
				} else /* tab */ {
					if (document.activeElement === modalContent) {
						closeButton.focus();
						e.preventDefault();
					}
				}
			});
		}
	}
}
