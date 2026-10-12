function($scope, $window, $location, $rootScope, $timeout, $uibModal, spUtil) {
    /* widget controller */
    var c = this;
	var deviceSysID = '';

    $scope.openDeviceRegistrationSetupDialog = function() {
        c.server.get({
            action: 'getMaxDeviceCount'
        }).then(function(response) {
            if ($scope.data.deviceCount >= response.data.maxDeviceCount) {
                spUtil.addErrorMessage(response.data.deviceErrorMsg);
            } else {
                $scope.deviceRegisterModalInstance = $uibModal.open({
                    templateUrl: 'deviceRegisterModalTemplate',
                    scope: $scope,
                    backdrop: 'static',
                    size: 'mg'
                });
                createCloseDeviceRegisterModalHandler('trusted-device-register', $scope.deviceRegisterModalInstance);
            }
        });

    }


    $scope.deleteDeviceRegistration = function() {
            c.server.get({
                action: 'remove_device',
                sysId: deviceSysID
            }).then(function(response) {
                $window.location.reload(true);
            });
	}

    function createCloseDeviceRegisterModalHandler(element, modalInstance) {
        // This is a hack. Wait for the inner iframe to load, then mock
        // the GlideDialogWindow close function to do the right thing. If it's not ready
        // after a second, try again 9 more times. 
        var retryCount = 0;
        var maxRetries = 10;
        tryOverrideGlideDialogWindowClose();

        function tryOverrideGlideDialogWindowClose() {
            $timeout(function() {
                var frameGlideDialogWindow = document.getElementById(element).contentWindow['GlideDialogWindow'];
                if (!frameGlideDialogWindow) {
                    retryCount++;
                    if (retryCount >= maxRetries)
                        return;

                    tryOverrideGlideDialogWindowClose();
                    return;
                }

                frameGlideDialogWindow.get = function() {
                    return {
                        destroy: function() {
                            $scope.dismissDeviceRegisterModal(modalInstance);
                        }
                    }
                };
            }, 1000);
        }
    }

    $scope.dismissDeviceRegisterModal = function(modalInstnace) {
        modalInstnace.close();
        $window.location.reload(true);
    }
	
	$scope.deleteDeviceRegistrationModal = function(sys_id) {
        deviceSysID = sys_id;
        c.server.get({
            action: 'retrieve_device',
            sysId: sys_id
        }).then(function(response) {
            if (response) {
                $scope.manageDeviceModalInstance = $uibModal.open({
                    templateUrl: 'manageDeviceModalTemplate',
                    scope: $scope,
                    size: 'mg',
                    controller: modalCtrl,
                    resolve: {
                        device_name: function() {
                            return response.data.device_name;
                        }
                    }
                });
            }
        })
    }
	
	function modalCtrl($scope, device_name) {
        $scope.device_name = device_name;
    }
	
	 $scope.dismissDeviceConfigurationModal = function(modalInstnace) {
		modalInstnace.close();
        $window.location.reload(true);
    }
};
