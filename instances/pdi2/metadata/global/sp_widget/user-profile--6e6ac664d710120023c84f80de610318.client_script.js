function ($scope, $element, $window, $location, $rootScope, $timeout, snAttachmentHandler, $http, spUtil, userPreferences, $filter, i18n, $uibModal, spAriaUtil) {

	// Many of these fields are more configuration-type fields than profile fields. We still want to display
	// these to a user who is configuring their 'settings', but we shouldn't show them on a user profile page.
	// We need to handle this better.
	var fieldExcludes = {
		sys_user: ['name', 'introduction', 'title', 'department', 'location', 'photo',
							 'manager', 'company'],
		live_profile: ['short_description', 'photo']
	}

	$scope.openConnectConversation = function() {
		$window.open('/$c.do#?user=' + $scope.data.liveProfileID, '_blank');
	}

	$scope.$watch('data.dateTimeFormat', function() {
		if ($scope.data.dateTimeFormat != g_user_date_time_format)
			$scope.data.dateTimeFormatChanged = true;
	});

	$scope.uploadNewProfilePicture = function($event) {
		$event.stopPropagation();
		var $el = $element.find('input[type=file]');
		$el.click();
	}

	$scope.attachFiles = function(files) {
		if (!files.files.length)
			return;

		var file = files.files[0];

		var validImage = false;

		switch(file.type) {
			case 'image/jpeg':
			case 'image/png':
			case 'image/bmp':
			case 'image/x-windows-bmp':
			case 'image/gif':
			case 'image/x-icon':
			case 'image/svg+xml':
				validImage = true;
				break;
			default:
				break;
		}

		if(!validImage) {
			alert(file.name + " " + i18n.getMessage("isn't a recognized image file format"));
			return;
		}

		snAttachmentHandler.create("live_profile", $scope.data.liveProfileID).uploadAttachment(file, {
			sysparm_fieldname: "photo"
		}).then(function(response) {
			var obj = {};
			obj.newAvatarId = response.sys_id;
			$scope.avatarPicture = {
				'background-image': "url('" + response.sys_id + ".iix')",
				'color': 'transparent'
			};
			$rootScope.$broadcast("sp.avatar_changed", obj);
			// timeout is required for screen reader to pick up the message once file upload prompt is dismissed
			$timeout(function() {
			   spAriaUtil.sendLiveMessage(i18n.getMessage('Profile picture updated successfully'));
			}, 500);
		});
	}

	$scope.avatarPicture = "";

	if ($scope.data.sysUserID) {
		$http.get('/api/now/live/profiles/sys_user.' + $scope.data.sysUserID).then(function (response) {
			if (response.data.result && response.data.result.avatar){
				var avatarPicture = response.data.result.avatar.replace("?t=small", "");
				$scope.avatarPicture = {
					'background-image': "url('" + avatarPicture + "')",
					'color': 'transparent'
				};
			}
		});
		spUtil.recordWatch($scope, "sys_user", "sys_id=" + $scope.data.sysUserID);
	}
	spUtil.recordWatch($scope, "live_profile", "sys_id=" + $scope.data.liveProfileID);

	$scope.connectEnabled = function() {
		return $scope.data.connectEnabled && !$scope.data.isLoggedInUsersProfile;
	}

	$scope.openUserProfile = function($event, userID) {
		$event.stopPropagation();
		$event.preventDefault();
		$location.search("id=user_profile&sys_id=" + userID);
	}

	$scope.getSysUserModelFields = function() {
		if ($scope.data.userExists) {
			return $scope.data.sysUserModelList
							.filter(function(field) {
								return $scope.displayField("sys_user", field.name);
							});
		}
		return [];
	}
	

	$scope.reloadPage = function() {
			$window.location.reload(true);
	};

	$scope.teamExists = function() {
		return $scope.data.teamData.direct_reports.length > 0 ||
			$scope.data.teamData.members.length > 0 ||
			$scope.data.teamData.manager;
	}

	var models = {
		sys_user: $scope.data.sysUserModel,
		live_profile: $scope.data.liveProfileModel
	}

	$scope.displayField = function(tableName, field, isHeader) {
		if (!isHeader && fieldExcludes[tableName].indexOf(field) > -1) return false;

		if (models[tableName][field] && models[tableName][field].type === "boolean") return false;

		if ($scope.data.isLoggedInUsersProfile) {
			if (models[tableName][field] && models[tableName][field].readonly)
				return models[tableName][field].displayValue;
			else
				return models[tableName][field];
		} else {
			return models[tableName][field] && models[tableName][field].displayValue;
		}
	}

	$timeout(function(){
		$rootScope.$broadcast('finishedChanged', {profile: $scope.data.teamData});
	});

	$scope.sysUserModelFields = $scope.getSysUserModelFields();

}
