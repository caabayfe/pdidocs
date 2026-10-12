function($scope, $element, $window, $location, $rootScope, $timeout, snAttachmentHandler, i18n, $http, spUtil, userPreferences, $filter, i18n, $uibModal) {
    /* widget controller */

    var c = this;
    var manageCred = '';
    var pageRoot = angular.element('.sp-page-root');
	$scope.doesClientSupportWebAuthn = !!($window.PublicKeyCredential);

    $scope.openTotpSetupDialog = function() {
        $scope.mfaModalInstance = $uibModal.open({
            templateUrl: 'totpModalTemplate',
            scope: $scope,
            size: 'lg'
        });
        createCloseMFAModalHandler('mfa-config-window',$scope.mfaModalInstance );
    }

	$scope.openTotpSetupChangeDialog = function() {
        $scope.mfaModalInstance = $uibModal.open({
            templateUrl: 'totpSetupChangeModalTemplate',
            scope: $scope,
            size: 'lg'
        });
        createCloseMFAModalHandler('mfa-config-window',$scope.mfaModalInstance );
    }

    $(window).keyup(function (e) {
		const  focusableElements ='i, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
		var modalElement = document.querySelectorAll('.modal');
   		if(modalElement.length > 0)
   		{
   			var modal = modalElement[0]; // select the modal by it's class
			const firstFocusableElement = modal.querySelectorAll(focusableElements)[0];
 			const focusableContent = modal.querySelectorAll(focusableElements);
 			if(focusableContent.length > 0) {
				const lastFocusableElement = focusableContent[focusableContent.length - 1];
 				var code = (e.keyCode ? e.keyCode : e.which);
   				var a = document.querySelectorAll('button.sr-only');
 				if (code == 9 && !e.shiftKey && focusableContent){
   				firstFocusableElement.focus();
 				}
 			}
 		}
   	});

    $scope.openInternalAuthenticatorSetupDialog = function() {
        $scope.internalAuthenticatorModalInstance = $uibModal.open({
            templateUrl: 'internalAuthenticatorModalTemplate',
            scope: $scope,
            size: 'lg'
        });
        createCloseMFAModalHandler('internalAuthenticator-config-window', $scope.internalAuthenticatorModalInstance);
    }


    $scope.openAuthenticatorKeySetupDialog = function() {
        $scope.authenticatorKeyModalInstance = $uibModal.open({
            templateUrl: 'hardwareModalTemplate',
            scope: $scope,
            size: 'lg'
        });
        createCloseMFAModalHandler('hardware-config-window', $scope.authenticatorKeyModalInstance);
    }


    $scope.openManageAuthenticator = function(sys_id, type) {
        manageCred = sys_id;
        c.server.get({
            action: "retrieve_authenticator",
            sysId: sys_id
        }).then(function(response) {
            if (response) {
                $scope.manageAuthenticatorModalInstance = $uibModal.open({
                    templateUrl: 'manageAuthenticatorModalTemplate',
                    scope: $scope,
                    size: 'lg',
                    controller: modalCtrl,
                    resolve: {
                        nickName: function() {
                            return response.data.web_auth_nickname;
                        },
                        registrationTime: function() {
                            return response.data.web_auth_registration_time;
                        },
                        lastUsedTime: function() {
                            return response.data.web_auth_last_used_time;
                        },
                        webAuthType: function() {
                            return response.data.web_auth_type;
                        }

                    }
                });
            }
        })
    }

    function modalCtrl($scope, nickName, registrationTime, lastUsedTime, webAuthType) {
        $scope.nickName = nickName;
        $scope.registrationTime = registrationTime;
        $scope.lastUsedTime = lastUsedTime;
        $scope.webAuthType = webAuthType;
    }

    function createCloseMFAModalHandler(element, modalInstance) {
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
                            $scope.dismissMFAConfigurationModal(modalInstance);
                        }
                    }
                };
            }, 1000);
        }
    }

    $scope.dismissMFAConfigurationModal = function(modalInstnace) {
		modalInstnace.close();
        $window.location.reload(true);
    }

    $scope.dismissManageAuthenticationModal = function() {
        $scope.manageAuthenticatorModalInstance.close();
        $window.location.reload(true);
    }

    $scope.removeAuthenticator = function() {
			 var areYouSure = confirm(i18n.getMessage("Are you sure you want to remove the authenticator ?"));
			 if (areYouSure == true) {
					c.server.get({
							action: "remove_authenticator",
							sysId: manageCred
					}).then(function(response) {
							$scope.dismissManageAuthenticationModal();
							$window.location.reload(true);
					});
			 }
    }

    $scope.disableMfa = function() {
        var areYouSure = confirm(i18n.getMessage("Are you sure you want to disable Multi-factor authentication ?"));
        if (areYouSure == true) {
            c.server.get({
                action: "disableMfa"
            }).then(function(response) {
                $scope.forgetAllRememberedBrowsersCall();
                $window.location.reload(true);
            });

        }
    }

    $scope.forgetAllRememberedBrowsers = function() {
        var areYouSure = confirm(i18n.getMessage("Are you sure you want to forget all remembered browsers ?"));
        if (areYouSure == true) {
            $scope.forgetAllRememberedBrowsersCall();
            document.getElementById("divNotificationMain").style.display = "block";

            document.getElementById("divNotificationMain").innerHTML = i18n.getMessage("The remembered browsers have been removed from the system. You will be prompted for MFA on next login.") + "<button class='btn-icon close icon-cross' onclick=hideNotification(); style='min-width: 0.5em; min-height:0.5em; line-height: normal;'></button>";
        }
    }

    $scope.forgetAllRememberedBrowsersCall = function() {
        c.server.get({
            action: "forgetAllRememberedBrowsersCall"
        }).then(function(response) {
           return;
        });
    }

    hideNotification = function() {
        document.getElementById("divNotificationMain").style.display = "none";
	$window.location.reload(true);
    }
}
