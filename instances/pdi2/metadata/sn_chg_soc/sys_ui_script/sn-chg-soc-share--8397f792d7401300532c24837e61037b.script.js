angular.module("sn.chg_soc.share", ["sn.common"])
	.constant("SOC_SHARE", {
		TRACKING_KEY: {
			SHARING: "Sharing Change Schedule"
		},
		ROLE: "sys_user_role",
		GROUP: "sys_user_group",
		USER: "sys_user",
		SERVICE: {
			GET_SUGGESTIONS: "/api/sn_chg_soc/soc/getSuggestions?sysparm_ck=",
			GET_PERMISSIONS: "/api/sn_chg_soc/soc/getPermissions?sysparm_ck=",
			ADD_INVITEES: "/api/sn_chg_soc/soc/addInvitees?sysparm_ck=",
			REMOVE_PERMISSIONS: "/api/sn_chg_soc/soc/removePermission?sysparm_ck=",
			UPDATE_PERMISSIONS: "/api/sn_chg_soc/soc/updatePermission?sysparm_ck="
		}
	})
	.service("suggestions", ["$http", "$q", "$window", "dataService", "SOC_SHARE", function($http, $q, $window, dataService, SOC_SHARE) {
		var suggestions = this;
		suggestions.current = [];
		suggestions.query = "";

		suggestions.lookup = function() {
			if (!suggestions.query)
				return;

			var url = SOC_SHARE.SERVICE.GET_SUGGESTIONS + $window.g_ck;
			$http.post(url, {
				query: suggestions.query,
				sys_id: dataService.definition.sys_id.value
			}).then(function(response) {
				if (!response.data.result)
					return;
				suggestions.current = response.data.result;
			});
		};

		suggestions.trackEvent = function() {
			dataService.trackEvent(SOC_SHARE.TRACKING_KEY.SHARING);
		};
	}])
	.directive("suggestionInput", ["$timeout", "suggestions", function($timeout, suggestions) {
		"use strict";

		var typeAheadTimeout;

		return {
			restrict: "E",
			replace: true,
			template: '<input id="recipient-input" aria-labelledby="soc-sharing-invitation-search-label" class="soc-suggestions"  ng-keyup="shareCtrl.keyUp($event)" ng-model="suggestions.query" placeholder="{{shareCtrl.messages[\'Add recipient\']}}"></input>',
			link: function(scope) {
				scope.suggestions = suggestions;
				scope.suggestions.query = "";

				scope.$watch("suggestions.query", function(newValue, oldValue) {
					if (!newValue || newValue === oldValue)
						return;

					if (newValue && newValue.length < 3) {
						suggestions.current = [];
						if (typeAheadTimeout)
							$timeout.cancel(typeAheadTimeout);
						return;
					}

					if (typeAheadTimeout)
						$timeout.cancel(typeAheadTimeout);

					typeAheadTimeout = $timeout(function() {
						suggestions.lookup();
					}, 500);

				});
			}
		}
	}])
	.service("shareService", ["$http", "$q", "$window", "dataService", "SOC_SHARE", function($http, $q, $window, dataService, SOC_SHARE) {
		var shareService = this;

		var _buildDataModel = function(result) {
			var permissions = {};
			if (!result)
				return permissions;
			permissions.users = result.shareUsers;
			permissions.groups = result.shareGroups;
			permissions.roles = result.shareRoles;
			permissions.everyone = result.shareWith === "1";
			return permissions;
		};

		shareService.getSelectedShareWithOption = function() {
			return dataService.definition.share_with.value + "";
		};

		shareService.getSocDefName = function() {
			return dataService.definition.name.display_value + "";
		};

		shareService.getPermissionLists = function() {
			var deferred = $q.defer();
			var url = SOC_SHARE.SERVICE.GET_PERMISSIONS + $window.g_ck;
			$http.post(url, {sys_id: dataService.definition.sys_id.value}).then(function(response) {
				deferred.resolve(_buildDataModel(response.data.result));
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		};

		shareService.addInvitees = function(invitation) {
			var deferred = $q.defer();
			var url = SOC_SHARE.SERVICE.ADD_INVITEES + $window.g_ck;
			$http.post(url, invitation).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		};

		shareService.removePermission = function(identityDetails) {
			var deferred = $q.defer();
			var url = SOC_SHARE.SERVICE.REMOVE_PERMISSIONS + $window.g_ck;
			var identityLite = {
				chg_soc_definition: dataService.definition.sys_id.value,
				sys_id: identityDetails.sys_id,
				tableName: identityDetails.tableName
			};
			$http.post(url, identityLite).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		};

		shareService.updatePermission = function(everyone, count) {
			var deferred = $q.defer();
			var url = SOC_SHARE.SERVICE.UPDATE_PERMISSIONS + $window.g_ck;
			var shareWith = {
				chg_soc_definition: dataService.definition.sys_id.value,
				everyone: everyone ? 1 : count > 0 ? 2 : ""
			};
			$http.post(url, shareWith).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		};

	}])
	.controller("removePermissionCtrl", ["$scope", "$uibModalInstance", "i18n", "shareService", function($scope, $uibModalInstance, i18n, shareService) {

		$scope.removeAccessMsg = i18n.format("Are you sure you want to remove {0} from this Change Schedule?", $scope.selectedProfile.name);

		$scope.messages = {
			"Remove access": i18n.getMessage("Remove access"),
			"Cancel": i18n.getMessage("Cancel"),
			"Remove": i18n.getMessage("Remove")
		};

		$scope.cancel = function() {
			$uibModalInstance.dismiss("cancel");
		};

		var _removePermissionSuccess = function(identityDetails) {
			$scope.$emit("sn.aside.change_soc_side.selected_profile_removed", identityDetails);
			$uibModalInstance.dismiss("cancel");
		};

		$scope.delete = function() {
			var selectedProfile = angular.copy($scope.selectedProfile);
			selectedProfile.chg_soc_definition = $scope.socDefId;
			if (selectedProfile.chg_soc_definition && selectedProfile.sys_id && selectedProfile.tableName)
				shareService.removePermission(selectedProfile).then(_removePermissionSuccess);
		};

	}])
	.directive("socAsideShare", ["getTemplateUrl", "shareService", "dataService", "suggestions", "i18n", "SOC_SHARE", "$uibModal", "$window", function(getTemplateUrl, shareService, dataService, suggestions, i18n, SOC_SHARE, $uibModal, $window) {
		"use strict";

		var _defaultSelectedTab = "all";
		var _defaultInviteMessage = i18n.format("{0} Change Schedule has been shared with you by {1}.", shareService.getSocDefName(), $window.NOW.user.firstName + " " + $window.NOW.user.lastName);
		// HTML escape message. User can then modify message in browser, and variable is then sanitized for XSS prevention.
		_defaultInviteMessage = _defaultInviteMessage.replace(/[&<>"'\/]/g, function (match) {
			var replacement = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#x27;',
				'/': '&#x2F;'
			};
			return replacement[match]
		});

		var _getIndexOf = function(permissions, identitySysId) {
			return permissions.map(function(data) { return data.sys_id; }).indexOf(identitySysId);
		};

		var _removeAllInstances = function(permissions, identitySysId) {
			var index = _getIndexOf(permissions, identitySysId);
			while (index !== -1) {
				permissions.splice(index, 1);
				index = _getIndexOf(permissions, identitySysId);
			}
		};

		var _flushView = function(views) {
			var viewKeys = Object.keys(views);
			for (var i = 0; i < viewKeys.length; i++)
				views[viewKeys[i]] = false;
		};

		var _sortByObjKey = function(field, reverse, primer) {
			var key = primer ? function(x) { return primer(x[field]); } : function(x) { return x[field]; };
			reverse = !reverse ? 1 : -1;
			return function(a, b) {
				a = key(a);
				b = key(b);
				return reverse * ((a > b) - (b > a));
			};
		};

		var _containsObject = function(list, obj, key) {
			if (!obj || !list || !key)
				return false;

			var listLength = list.length;

			if (listLength === 0)
				return false;

            for (var i = 0; i < listLength; i++)
                if (list[i][key] === obj[key])
                    return true;
            return false;
        };

        var _difference = function(arr1, arr2, key) {
			return arr1.filter(function(obj) {
				return !_containsObject(arr2, obj, key);
			});
        };

		return {
			restrict: "E",
			templateUrl: getTemplateUrl("sn_chg_soc_aside_share_body.xml"),
			scope: {
				socDefId: "=",
				activeAside: "="
			},
			link: function(scope, elem, attrs, shareCtrl) {

				scope.$watch("activeAside", function(newValue, oldValue) {
					if (newValue && newValue === "share")
						shareCtrl.initDataModel();
				});

				scope.$watch("shareCtrl.permissions.everyone", function(newValue, oldValue) {
					if (newValue === oldValue)
						return;
					shareCtrl.view.checkboxDisabled = true;
					shareService.updatePermission(newValue, shareCtrl.permissions.all.length).then(function(result) {
						shareCtrl.view.checkboxDisabled = false;

						if (result.updated) {
							var shareWithValue = result.shareWith;
							dataService.definition.share_with.value = shareWithValue;
							shareCtrl.permissions.everyone = shareWithValue === 1;
							shareCtrl.view.listPermissionsTabs = !shareCtrl.permissions.everyone;
						}
						else
							console.error(result);

					});
				});

				scope.$on("sn.aside.change_soc_side.selected_profile_removed", function(currentScope, identityDetails) {
					var identitySysId = identityDetails.sys_id;

					// Remove permission from 'All' list
					_removeAllInstances(shareCtrl.permissions.all, identitySysId);

					// Remove permission from specific list
					switch (identityDetails.tableName) {
						case SOC_SHARE.ROLE:
							_removeAllInstances(shareCtrl.permissions.roles, identitySysId);
							break;
						case SOC_SHARE.GROUP:
							_removeAllInstances(shareCtrl.permissions.groups, identitySysId);
							break;
						case SOC_SHARE.USER:
							_removeAllInstances(shareCtrl.permissions.users, identitySysId);
							break;
					}
					shareCtrl.view.selectedProfile = {};
					scope.selectedProfile = shareCtrl.view.selectedProfile;
				});

			},
			controllerAs: "shareCtrl",
			controller: function($scope, $rootScope, $timeout, $sanitize) {
				var shareCtrl = this;

				var _inviteSuccess = function(invitationResponse) {
					_flushInvitation();

					if (!invitationResponse.updated) {
						// TODO show error permissions not updated
						shareCtrl.showSharingView("listPermissions");
						return;
					}

					invitationResponse.recipients.forEach(function(recipient) {
						if (!_containsObject(shareCtrl.permissions.all, recipient, "sys_id"))
							shareCtrl.permissions.all.push(recipient);
						switch (recipient.tableName) {
							case SOC_SHARE.ROLE:
								if (!_containsObject(shareCtrl.permissions.roles, recipient, "sys_id"))
									shareCtrl.permissions.roles.push(recipient);
								break;
							case SOC_SHARE.GROUP:
								if (!_containsObject(shareCtrl.permissions.groups, recipient, "sys_id"))
									shareCtrl.permissions.groups.push(recipient);
								break;
							case SOC_SHARE.USER:
								if (!_containsObject(shareCtrl.permissions.users, recipient, "sys_id"))
									shareCtrl.permissions.users.push(recipient);
								break;
						}
					});

					if (invitationResponse.recipients.length > 0) {
						shareCtrl.permissions.all = shareCtrl.permissions.all.sort(_sortByObjKey("name", false, function(a) { return a.toUpperCase(); }));
						shareCtrl.permissions.users = shareCtrl.permissions.users.sort(_sortByObjKey("name", false, function(a) { return a.toUpperCase(); }));
						shareCtrl.permissions.roles = shareCtrl.permissions.roles.sort(_sortByObjKey("name", false, function(a) { return a.toUpperCase(); }));
						shareCtrl.permissions.groups = shareCtrl.permissions.groups.sort(_sortByObjKey("name", false, function(a) { return a.toUpperCase(); }));
					}
					shareCtrl.showSharingView("listPermissions");
				};

				var _getTopOfViewStack = function() {
					return shareCtrl.view.stack[shareCtrl.view.stack.length - 1];
				};

				var _flushInvitation = function() {
					shareCtrl.invitation.inviteMessage = _defaultInviteMessage;
					shareCtrl.invitation.recipients = [];
					$scope.pendingRecipients = shareCtrl.invitation.recipients;
				};

				shareCtrl.i18n = i18n;

				shareCtrl.messages = {
					"Access": i18n.getMessage("Access"),
					"Cancel": i18n.getMessage("Cancel"),
					"Close panel": i18n.getMessage("Close panel"),
					"Share": i18n.getMessage("Share"),
					"Sharing": i18n.getMessage("Sharing"),
					"Share with": i18n.getMessage("Share with"),
					"Invite": i18n.getMessage("Invite"),
					"Profile": i18n.getMessage("Profile"),
					"All": i18n.getMessage("All"),
					"Groups": i18n.getMessage("Groups"),
					"Users": i18n.getMessage("Users"),
					"Roles": i18n.getMessage("Roles"),
					"Recipients": i18n.getMessage("Recipients"),
					"MESSAGE": i18n.getMessage("MESSAGE"),
					"Remove access": i18n.getMessage("Remove access"),
					"1 user": i18n.getMessage("1 user"),
					"{0} users": i18n.getMessage("{0} users"),
					"1 group": i18n.getMessage("1 group"),
					"{0} groups": i18n.getMessage("{0} groups"),
					"1 role": i18n.getMessage("1 role"),
					"{0} roles": i18n.getMessage("{0} roles"),
					"View {0} profile": i18n.getMessage("View {0} profile"),
					"Remove": i18n.getMessage("Remove"),
					"Remove {0}": i18n.getMessage("Remove {0}"),
					"Share with everyone": i18n.getMessage("Share with everyone"),
					"Shared with everyone": i18n.getMessage("Shared with everyone"),
					"Are you sure you want to remove {0} from this Change Schedule?": i18n.getMessage("Are you sure you want to remove {0} from this Change Schedule?"),
					"Remove access to Change Schedule": i18n.getMessage("Remove access to Change Schedule"),
					"{0} Change Schedule has been shared with you by {1}.": i18n.getMessage("{0} Change Schedule has been shared with you by {1}."),
					"This change schedule hasn't been shared with any groups": i18n.getMessage("This change schedule hasn't been shared with any groups"),
					"This change schedule hasn't been shared with any users": i18n.getMessage("This change schedule hasn't been shared with any users"),
					"This change schedule hasn't been shared with any roles": i18n.getMessage("This change schedule hasn't been shared with any roles"),
					"This change schedule hasn't been shared with anyone": i18n.getMessage("This change schedule hasn't been shared with anyone"),
					"Add groups, users and roles": i18n.getMessage("Add groups, users and roles"),
					"Back to sharing panel permissions list view": i18n.getMessage("Back to sharing panel permissions list view"),
					"Error while inviting users, groups or roles.": i18n.getMessage("Error while inviting users, groups or roles."),
					"Add recipient": i18n.getMessage("Add recipient"),
					"Send an e-mail invitation": i18n.getMessage("Send an e-mail invitation")
				};

				shareCtrl.view = {
					listPermissionsTabs: false,
					checkboxDisabled: false,
					selectedProfile: {},
					showRemoveButton: false,
					selectedTab: _defaultSelectedTab,
					stack: ["listPermissions"],
					views: {
						listPermissions: true,
						inviteUsers: false,
						profile: false
					}
				};

				shareCtrl.permissions = {
					everyone: false,
					all: [],
					roles: [],
					groups: [],
					users: []
				};

				shareCtrl.invitation = {
					sendEmail: true,
					inviteMessage: _defaultInviteMessage,
					recipients: []
				};

				$scope.pendingRecipients = shareCtrl.invitation.recipients;

				// link controller directory to service
				shareCtrl.suggestions = suggestions;

				shareCtrl.keyUp = function(event) {
					event.stopPropagation();
					if (event.keyCode === 40 && !event.altKey) {
						var firstElem = angular.element("li.sn-soc-suggestion")[0];
						if (firstElem)
							firstElem.focus();
					}
				};

				shareCtrl.getPermissions = function() {
					shareService.getPermissionLists().then(function(permissions) {
						if (shareCtrl.permissions.everyone !== permissions.everyone)
							shareCtrl.permissions.everyone = permissions.everyone;
						if (permissions.users)
							shareCtrl.permissions.users = permissions.users.sort(_sortByObjKey("name", false, function(a) { return a.toUpperCase(); }));

						if (permissions.groups)
							shareCtrl.permissions.groups = permissions.groups.sort(_sortByObjKey("name", false, function(a) { return a.toUpperCase(); }));

						if (permissions.groups)
							shareCtrl.permissions.roles = permissions.roles.sort(_sortByObjKey("name", false, function(a) { return a.toUpperCase(); }));

						var all = shareCtrl.permissions.users.slice().concat(shareCtrl.permissions.groups).concat(shareCtrl.permissions.roles);
						shareCtrl.permissions.all = all.sort(_sortByObjKey("name", false, function(a) { return a.toUpperCase(); }));

						shareCtrl.view.listPermissionsTabs = !shareCtrl.permissions.everyone;
					});
				};

				/**
				 * Enables navigating back in she sharing panel
				 */
				shareCtrl.goBack = function() {
					shareCtrl.view.stack.pop();
					_flushView(shareCtrl.view.views);
					shareCtrl.view.views[shareCtrl.view.stack[shareCtrl.view.stack.length - 1]] = true;

					// Flush the service
					shareCtrl.suggestions.query = "";
					shareCtrl.suggestions.current = [];
				};

				shareCtrl.showProfileView = function(selectedProfile, $event) {
					if ("profile" !== _getTopOfViewStack() && "removePermissionButton" !== $event.target.name) {
						shareCtrl.view.stack.push("profile");
						_flushView(shareCtrl.view.views);
						shareCtrl.view.views[shareCtrl.view.stack[shareCtrl.view.stack.length - 1]] = true;
						shareCtrl.view.selectedProfile = selectedProfile;
						shareCtrl.view.showRemoveButton = shareCtrl.view.selectedProfile.tableName === SOC_SHARE.USER
							|| shareCtrl.view.selectedProfile.tableName === SOC_SHARE.GROUP
							|| shareCtrl.view.selectedProfile.tableName === SOC_SHARE.ROLE;
					}
				};

				/**
				 * Event propagation is stopped not to trigger the onclick event which can further trigger showProfileView method.
				 *
				 * @param identityDetails
				 * @param $event
				 */
				shareCtrl.removePermission = function(identityDetails, $event) {
					if ("listPermissions" !== _getTopOfViewStack())
						shareCtrl.showSharingView("listPermissions");
					$event.stopPropagation();
					shareCtrl.view.selectedProfile = identityDetails;
					$scope.selectedProfile = shareCtrl.view.selectedProfile;
					var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: getTemplateUrl("sn_chg_soc_remove_permission_def.xml"),
						controller: "removePermissionCtrl",
						scope: $scope,
						size: "sm"
					});
				};

				/**
				 * Enables showing and hiding blocks of the sharing panel
				 * when user drills down
				 */
				shareCtrl.showSharingView = function(viewName) {
					shareCtrl.view.stack.push(viewName);
					_flushView(shareCtrl.view.views);
					shareCtrl.view.views[shareCtrl.view.stack[shareCtrl.view.stack.length - 1]] = true;
					if ("inviteUsers" === viewName)
						$rootScope.$broadcast("sn.aside.change_soc_side.open_share:opened");
				};

				shareCtrl.initDataModel = function() {
					// Flush Views
					_flushView(shareCtrl.view.views);
					shareCtrl.view.stack.splice(0, shareCtrl.view.stack.length);
					shareCtrl.view.stack.push("listPermissions");
					shareCtrl.view.views[shareCtrl.view.stack[shareCtrl.view.stack.length - 1]] = true;
					shareCtrl.view.listPermissionsTabs = !shareCtrl.permissions.everyone;
					shareCtrl.view.selectedTab = _defaultSelectedTab;

					// Flush suggestions
					shareCtrl.suggestions.query = "";
					shareCtrl.suggestions.current = [];

					_flushInvitation();
				};

				shareCtrl.closeView = function() {
					$scope.$emit("sn.aside.change_soc_side.open_share:closed");
				};

				/**
				 * Clicking the Invite button sends out invitations to the selected users and groups, and role.
				 */
				shareCtrl.invite = function() {
					if (shareCtrl.invitation.recipients && shareCtrl.invitation.recipients.length > 0) {
						suggestions.trackEvent();
						shareCtrl.invitation.recipients = _difference(shareCtrl.invitation.recipients, shareCtrl.permissions.all, "sys_id");
						var invitation = angular.copy(shareCtrl.invitation);
						invitation.chg_soc_definition = $scope.socDefId;
						invitation.inviteMessage = $sanitize(shareCtrl.invitation.inviteMessage);
						shareService.addInvitees(invitation).then(_inviteSuccess);
					}
				};

			}
		};
	}]);
