window.NOW = window.NOW || {};
window.NOW.isPolarisEnabled = "${sn_ui.PolarisUI.isEnabled()}";
window.NOW.oc_esc_modal = window.NOW.oc_esc_modal || {};
window.NOW.oc_esc_modal.chat_enabled = "$[jvar_connect_installed_and_enabled]";
window.NOW.user_id = "$[jvar_user.getID()]";
window.NOW.oc_esc_modal.groupId = "$[JS:RP.getParameterValue('sysparm_group_id')]";
window.NOW.oc_esc_modal.rotaId = "$[JS:RP.getParameterValue('sysparm_rota_id')]";
window.NOW.oc_esc_modal.startDate = "$[JS:RP.getParameterValue('sysparm_start_date')]";
window.NOW.oc_esc_modal.task = {
	table: "$[JS:RP.getParameterValue('sysparm_task_table')]",
	sys_id: "$[JS:RP.getParameterValue('sysparm_task_sys_id')]"
};
window.g_ck = "$[gs.getSessionToken()]";
window.NOW.oc_esc_modal.communicationTypes = '$[JS:jvar_communication_types]';
window.NOW.oc_esc_modal.communicationTypes = JSON.parse(window.NOW.oc_esc_modal.communicationTypes);
window.NOW.oc_esc_modal.isRTL = textDirection;
window.NOW.is_Notify= $[new GlidePluginManager().isActive('com.snc.notify')] == true;
window.NOW.is_Slack= '$[JS:jvar_use_slack_dm]' == 'true' && '$[JS:jvar_is_preview_slack_enabled]' == 'true';
window.NOW.is_Teams= '$[JS:jvar_use_msteams_dm]' == 'true';
window.NOW.is_MobileNotif = $[new GlidePluginManager().isActive('com.sn_on_call_m_notif')] == true && $[new GlidePluginManager().isActive('com.sn_itsm_mobile_agent')] == true; 
angular.module("sn.on_call.esc_path", ["sn.common", "ui.bootstrap", "sn.on_call.esc_path.extra"]);

angular.module('sn.on_call.esc_path').constant('keys', {
	leftKey: 37,
	rightKey: 39,
	tab: 9,
	esc: 27
});

angular.module('sn.on_call.esc_path').config(function ($uibTooltipProvider) {
	var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;
	if (isTouchDevice) {
		var options = {
			trigger: 'none'
		};
		$uibTooltipProvider.options(options);
	}
});

angular.module("sn.on_call.esc_path").controller("ModalInstanceCtrl", function($scope, i18n, getTemplateUrl, HighlightService, rosterEscPopupUtils, $window, $timeout, $q, $http, keys) {
	$scope.modalInstanceCtrl = {};
	$scope.modalInstanceCtrl.groupDetails = {};
	$scope.modalInstanceCtrl.form = {};
	$scope.modalInstanceCtrl.form.close = i18n.getMessage("Close");
	$scope.modalInstanceCtrl.form.oncallMembers = i18n.getMessage("On-Call Members");
	$scope.modalInstanceCtrl.form.filterTitle = i18n.getMessage("Filter by member name");
	$scope.modalInstanceCtrl.form.profile = i18n.getMessage("Profile");
	$scope.modalInstanceCtrl.form.noResultsFound = i18n.getMessage("No results found");
	$scope.noEscalateeMsg = i18n.getMessage("No Escalatee");	
	$scope.task = $window.NOW.oc_esc_modal.task;
	
	$scope.notification = {};
	$scope.notification.rotas = [];
	$scope.notification.visible = false;
	
	$scope.showingRotaIndex = 0;
	$scope.nextRotas = [];
	
	$scope.currentRotaTimeSpan = "";
	$scope.currentRota = {};
	
	$scope.endLevelOverallDelay = "";
	
	$scope.escalationSetPicker = {
		table: 'cmn_rota_escalation_set'
	};
	
	$scope.esclationAudiences = {
		userDetails: [],
		groupDetails: [],
		deviceDetails: []
	};
	
	$scope.profile = {
		profileTypeMap: {
			user: "user",
			group: "group",
			device: "device"
		},
		selectedProfile: "",
		profileData: {}
	};
	
	$scope.tabDetails = {
		selectedTab: "escalations",
		tabs: ["shifts", "escalations"],
		tabsContainer: "oc-shifts-tab-container"
	};
	$scope.profilePreferenceTabConfig = {
		selectedTab: "profile",
		tabs: ["profile", "preference"],
		tabsContainer: "profile-pref-tab-container"
	};
	$scope.responseType = {
		success: "success",
		error: "error"
	};
	
	$scope.isRTL = $window.NOW.oc_esc_modal.isRTL === "rtl";
	
	$scope.modalTitle = "";
	
	$scope.hasNoEscalatee = function() {
		return (
				!$scope.esclationAudiences ||  
				($scope.esclationAudiences.userDetails && $scope.esclationAudiences.userDetails.length === 0 &&
				$scope.esclationAudiences.deviceDetails && $scope.esclationAudiences.deviceDetails.length === 0 &&
				$scope.esclationAudiences.groupDetails && $scope.esclationAudiences.groupDetails.length === 0)
			);
	};
	
	function activateTab(tabConfig) {
		var tabsContainer = document.getElementById(tabConfig.tabsContainer);
		var tabs = tabsContainer.childNodes;
		
		// First Deactivate all the tabs
		for (var index = 0; index < tabs.length; index++) {
			var tab = tabs[index];
			tab.removeEventListener("focus", $scope.focusSelectedTab);
		}
		
		// Activate the currently selected tab
		var selectedTabIndex = tabConfig.tabs.indexOf(tabConfig.selectedTab);
	}

	// Only activate tab on focus if it still has focus after the delay
	function checkTabFocus(target, tabConfig) {
		var focusedElement = document.activeElement;

		if (target === focusedElement) {
			activateTab(tabConfig);
		}
	}

	$scope.focusSelectedTab = function(event, tabConfig) {
		var target = event.target;
		$timeout(checkTabFocus, 0, false, target, tabConfig);
	};

	$scope.arrowPressHandler = function(event, tabConfig) {
		var selectedTabIndex = tabConfig.tabs.indexOf(tabConfig.selectedTab);
		var leftRightKeyPressed = false;
		switch (event.keyCode) {
			case keys.leftKey:
				selectedTabIndex = (selectedTabIndex + 1 == tabConfig.tabs.length) ? 0 : selectedTabIndex + 1;
				leftRightKeyPressed = true;
				break;
			case keys.rightKey:
				selectedTabIndex = (selectedTabIndex - 1 == -1) ? tabConfig.tabs.length - 1 : selectedTabIndex - 1;
				leftRightKeyPressed = true;
				break;
		}

		if (!leftRightKeyPressed)
			return;
		
		var tabsContainer = document.getElementById(tabConfig.tabsContainer);
		var tabs = tabsContainer.childNodes;
		for (var index = 0; index < tabs.length; index++) {
			tabs[index].addEventListener("focus", function(event) {
				return $scope.focusSelectedTab(event, tabConfig);
			});
		}

		tabConfig.selectedTab = tabConfig.tabs[selectedTabIndex];
		tabs[selectedTabIndex].focus();
	};
	
	$scope.tabClickHandler = function(tabConfig, selectedTabIndex, callback) {
		tabConfig.selectedTab = tabConfig.tabs[selectedTabIndex];
		activateTab(tabConfig);
		if (callback)
			callback();
	};
	
	$scope.escalationTabCallback = function() {
		// Select first level on call member to show on the profile
		if ($scope.escPathData.type === $scope.responseType.success && $scope.escPathData.data.length > 0)
			$scope.updateAvatarsPerLevel($scope.escPathData.data[0]);
		else
			$scope.profile = {};
	};
	
	$scope.rosterTabCallback = function() {
		if ($scope.modalInstanceCtrl.members && $scope.modalInstanceCtrl.members.length > 0) {
			$scope.profile.profileData = $scope.modalInstanceCtrl.members[0];
			$scope.profile.selectedProfile = $scope.profile.profileTypeMap.user;
		} else {
			$scope.profile = {};
		}
	};
	
	$scope.$watch("tabDetails.selectedTab", function(newVal, oldVal) {
		if (newVal && newVal !== oldVal && newVal === $scope.tabDetails.tabs[0])
			$scope.profilePreferenceTabConfig.selectedTab = $scope.profilePreferenceTabConfig.tabs[0];
	});

	function getMembers(_group) {
		var members = [];
		if (_group && _group.rota && _group.rota.rosters) {
			_group.rota.rosters.forEach(function(roster) {
				if (roster && roster.member && roster.member.user && roster.member.user.sys_id) {
					var isManager = false;
					if (_group.manager.indexOf(roster.member.user.sys_id) !== -1)
						isManager = true;
					roster.member.isManager = isManager;
					if (roster.member.user && roster.member.user.name)
						roster.member.user.name = {
							display_value: roster.member.user.name
						};
					members.push(roster.member);
				}
			});
		}
		return members;
	}
	
	function processUserDetails(userDetails, groupDetails) {
		return userDetails.forEach(function (userDetail) {
			if (userDetail.user.sys_id === groupDetails.manager.value)
				userDetail.isManager = true;
			else
				userDetail.isManager = false;
			userDetail.user.name = {
				display_value: userDetail.user.name
			};
		});
	}
	
	function processDeviceDetails(deviceDetails) {
		deviceDetails.forEach(function(device) {
			device.type.display_value = i18n.format(i18n.getMessage("Type: {0}"), device.type.display_value);
			device.email_address.display_value = i18n.format(i18n.getMessage("Email: {0}"), device.email_address.display_value);
			device.phone_number.display_value = i18n.format(i18n.getMessage("Phone number: {0}"), device.phone_number.display_value);
		});
	}
	
	function preProcessData(escalationDetails, groupDetails) {
		escalationDetails.forEach(function(escDetail) {
			if (escDetail.escAudiences) {
				processUserDetails(escDetail.escAudiences.userDetails, groupDetails);
				processDeviceDetails(escDetail.escAudiences.deviceDetails);
			}
		});
	}
	
	function updateGroupTitle(groupDetails, currentRota) {
		if (groupDetails && groupDetails.name) {
			if (currentRota) {
				$scope.modalTitle = i18n.format(i18n.getMessage("{0} ({1}) {2} to {3}"), [groupDetails.name.display_value, currentRota.name, currentRota.startDisplayValue, currentRota.endDisplayValue]);
			} else {
				$scope.modalTitle = groupDetails.name.display_value;
			}
		}
	}
	
	function organizeOverlappingRotas() {
		if ($scope.nextRotas.length > 0 && !!$scope.currentRota) {
			for (var counter = $scope.showingRotaIndex; counter < $scope.nextRotas.length; counter++) {
				if ($scope.nextRotas[counter].rota_id === $scope.currentRota.rotaSysId && $scope.nextRotas[counter].start === $scope.currentRota.start) {
					$scope.showingRotaIndex = counter;
					break;
				}
			}
		}
	}

	$scope.changeEscalationSet = function() {
		$scope.lastActiveElement = document.getElementById("escalation-set-dropdown");
		$scope.loadModalData($window.NOW.oc_esc_modal.groupId, $scope.currentRota.rotaSysId, $scope.currentRota.start, $scope.currentEscalationSet.sys_id);
	};

	function initEscalationSets() {
		$scope.rotaEscalationSetsMap = {};
		$scope.currentEscalationSet = {};
	}
	initEscalationSets();
	function getRotaEscalationSets(rotaId) {
		var deferred = $q.defer();
		
		if ($scope.rotaEscalationSetsMap[rotaId]) {
			var escalationSets = $scope.rotaEscalationSetsMap[rotaId].data;
			updateCustomEscalationMessage(escalationSets);
			deferred.resolve(escalationSets);
			return deferred.promise;
		}
			
		var url = "/api/now/on_call_rota/escalationsets?rota_id=" + rotaId + '&task_table=' + $scope.task.table + '&task_sys_id=' + $scope.task.sys_id;
		$http.get(url).then(function(response) {
			var escalationSets = response.data.result;

			if ($scope.task  && $scope.task.table) {
				for (var i = 0; i < escalationSets.length; i++) {
					var escalationSet = escalationSets[i];
					if (!escalationSet.is_default && escalationSet.table.value != $scope.task.table) {
						escalationSets.splice(i, 1);
						i--;
					}
				}
			}
			updateCustomEscalationMessage(escalationSets);
			$scope.rotaEscalationSetsMap[rotaId] = {
				data: escalationSets
			};
			deferred.resolve($scope.rotaEscalationSetsMap[rotaId].data);
		}, function(response) {
			deferred.reject(response);
		});
		return deferred.promise;
	}
	
	function updateCustomEscalationMessage(escalationSets) {
		if ($scope.task  && $scope.task.table) {
			var tableName = '';
			if (escalationSets && escalationSets.length > 0) {
				for (var i = 0; i < escalationSets.length; i++) {
					var escalationSet = escalationSets[i];
					if (!escalationSet.is_default && escalationSet.table.value == $scope.task.table) {
						tableName = escalationSet.table.display_value;
						break;
					}
				}
			}
			
			$scope.customEscalationMessage = i18n.format(i18n.getMessage('Only Escalation policies defined on {0} table and "Default Escalation" are available for viewing'), tableName);
		}
	}

	$scope.loadModalData = function(groupId, rotaId, startDate, escalationSetSysId) {
		// Same date will be passed to the contact preference as well
		$scope.shiftStartTime = startDate;
		$scope.loadingEscalationPlan = true;
		escalationSetSysId = escalationSetSysId || "";
		if (!escalationSetSysId && $scope.rotaEscalationSetsMap[rotaId] && $scope.rotaEscalationSetsMap[rotaId].current) {
			escalationSetSysId = $scope.rotaEscalationSetsMap[rotaId].current;
		}
		var dfd = $q.defer();
		rosterEscPopupUtils.onCallShifts(groupId, rotaId, startDate, escalationSetSysId, $scope.task.table, $scope.task.sys_id).then(function(response) {
			if (response && response.escalationDetails && response.escalationDetails.type === $scope.responseType.success) {
				preProcessData(response.escalationDetails.data, response.groupDetails);
			}
			$scope.escPathData = response.escalationDetails;
			$scope.modalInstanceCtrl.onCallGroupMembers = response.groupOnCallMembers;
			$scope.modalInstanceCtrl.groupDetails = response.groupDetails;
			$scope.modalInstanceCtrl.members = getMembers($scope.modalInstanceCtrl.onCallGroupMembers[0]);
			$scope.currentRota = response.curRotaDetails;
			$scope.endLevelOverallDelay = response.endLevelOverallDelay;
			if (!$scope.shiftStartTime)
				$scope.escPathStartTimeMessage = i18n.getMessage("Escalation Path details are as of current date and time");
			else if ($scope.currentRota)
				$scope.escPathStartTimeMessage = i18n.format(i18n.getMessage("Escalation Path details are as of {0}"), $scope.currentRota.startDisplayValue);
			if ($scope.currentRota && $scope.currentRota.isCustomEscalation) {
				getRotaEscalationSets($scope.currentRota.rotaSysId).then(function(escalationSets) {
					$scope.escalationSets = escalationSets;
					for (var i = 0; i < $scope.escalationSets.length; i++) {
						var escalationSet = $scope.escalationSets[i];
						if (escalationSetSysId) {
							if (escalationSetSysId === escalationSet.sys_id) {
								$scope.currentEscalationSet = angular.copy(escalationSet);
								break;
							}
						}
						else {
							if (escalationSet.condition_matched) {
								$scope.currentEscalationSet = angular.copy(escalationSet);
								break;
							}
						}
					}
					$scope.rotaEscalationSetsMap[$scope.currentRota.rotaSysId].current = $scope.currentEscalationSet.sys_id;
					$timeout(function() {
						if ($scope.currentEscalationSet.sys_id) {
							var select2Box = angular.element('#escalation-set-dropdown');
							select2Box.val($scope.currentEscalationSet.sys_id).trigger('change');
							if ($scope.lastActiveElement && select2Box)
								select2Box.select2('focus');
							$scope.lastActiveElement = null;
						}
					});

				});
			}
			// Update modal title
			updateGroupTitle(response.groupDetails, response.curRotaDetails);
			
			if (response.overlappingRotas.length > 0) {
				$scope.notification.rotas = response.overlappingRotas;
				$scope.notification.visible = true;
			} else
				$scope.notification.visible = false;

			// Select first level on call member to show on the profile
			if (response.escalationDetails.type === $scope.responseType.success && response.escalationDetails.data.length > 0)
				$scope.updateAvatarsPerLevel(response.escalationDetails.data[0]);
			else
				$scope.updateAvatarsPerLevel({
					escAudiences: {
						userDetails: [],
						groupDetails: [],
						deviceDetails: []
					}
				});
			$scope.loadingEscalationPlan = false;
			dfd.resolve();
		}, function() {
			$scope.loadingEscalationPlan = false;
		});
		return dfd.promise;
	};

	$scope.modalInstanceCtrl.highlight = function(text, search) {
		return HighlightService.highlight(text, search, "oc-search-highlight");
	};

	$scope.modalInstanceCtrl.getRosterName = function(rosterSysId) {
		var rosterName = "";
		$scope.modalInstanceCtrl.onCallGroupMembers[0].rota.rosters.forEach(function(roster) {
			if (roster.sys_id.indexOf(rosterSysId) !== -1)
				rosterName = roster.name;
		});
		return rosterName;
	};
	
	$scope.getBackgroundStyle = function (avatarDetails) {
		if(avatarDetails)
			return { "background-image": "url(" + avatarDetails.user.avatar + ")" };
		return "";
	};
	
	$scope.showOverlappingRota = function(rota) {
		$scope.loadModalData($window.NOW.oc_esc_modal.groupId, rota.rotaSysId);
	};
	
	$scope.getAdditionalMembers = function(escAudience) {
		if (!escAudience)
			return 0;
		
		var additionalMembersCount = escAudience.userDetails.length + escAudience.deviceDetails.length + escAudience.groupDetails.length;
		if (!additionalMembersCount)
			additionalMembersCount = 0;
		return additionalMembersCount;
	};

	$scope.getLevelTitle = function(escalation) {
		var name = "";
		var escAudience = escalation.escAudiences;
		if (!escAudience)
			return $scope.noEscalateeMsg;
		
		var additionalMemberCount = $scope.getAdditionalMembers(escAudience) - 1;

		if (escAudience.userDetails.length > 0) {
			var userDetail = escAudience.userDetails[0].user;
			if (userDetail.name)
				name = userDetail.name.display_value;
		} else if (escAudience.groupDetails.length > 0) {
			var grpDetail = escAudience.groupDetails[0];
			if (grpDetail.name)
				name = grpDetail.name.display_value;
		} else if (escAudience.deviceDetails.length) {
			var deviceDetail = escAudience.deviceDetails[0];
			if (deviceDetail.name)
				name = deviceDetail.name.display_value;
		}
		if (additionalMemberCount > 0)
			return name + " " + " +" + additionalMemberCount;		
		
		return name;
	};

	function setProfileTypeData(escalation) {
		var esclationAudiences = escalation.escAudiences;
		if (esclationAudiences) {
		    if (esclationAudiences.userDetails.length > 0) {
			    $scope.profile.selectedProfile = $scope.profile.profileTypeMap.user;
			    $scope.profile.profileData = esclationAudiences.userDetails[0];
		    } else if (esclationAudiences.groupDetails.length > 0) {
			    $scope.profile.selectedProfile = $scope.profile.profileTypeMap.group;
			    $scope.profile.profileData = esclationAudiences.groupDetails[0];
		    } else if (esclationAudiences.deviceDetails.length > 0) {
			    $scope.profile.selectedProfile = $scope.profile.profileTypeMap.device;
			    $scope.profile.profileData = esclationAudiences.deviceDetails[0];
		    }
	    }
		else {
			$scope.profile.selectedProfile = "";
			$scope.profile.profileData = {};
		}
	}

	$scope.updateProfileDetails = function(profileData, profileType) {
		$scope.profile.profileData = profileData;
		$scope.profile.selectedProfile = profileType;
		updateUserProfilePreference();
	};
	
	$scope.selectRosterProfile = function (profileData, profileType, $event) {
		$scope.profile.profileData = profileData;
		$scope.profile.selectedProfile = profileType;
		$event.currentTarget.focus();
	};

	$scope.updateAvatarsPerLevel = function(escalation) {
		setProfileTypeData(escalation);
		$scope.esclationAudiences = escalation.escAudiences;
		$scope.selectedEscalationLevelLevel = escalation.level - 1;
		$scope.selectedRosterName = escalation.rosterDetails ? escalation.rosterDetails.name : "";
		updateUserProfilePreference(false);
	};
	
	function updateUserProfilePreference () {
		if ($scope.profile.selectedProfile === $scope.profile.profileTypeMap.user) {
			$scope.isUserPreferenceLoading = true;
			$scope.userPreferenceExtraDetails = {};
			$scope.userPreferenceExtraDetails.rosterName = $scope.selectedRosterName;
			$scope.userPreferenceExtraDetails.startDateTimeDisplay = $scope.shiftStartTime ? $scope.currentRota.startDisplayValue : "";
			$scope.userPreferenceExtraDetails.userId = $scope.profile.profileData.user.sys_id;
			$scope.userPreferenceExtraDetails.userName = $scope.profile.profileData.user.name.display_value;
			var groupId = $window.NOW.oc_esc_modal.groupId;
			var userId = $scope.profile.profileData.user.sys_id;
			var rotaId = $scope.currentRota.rotaSysId;
			var startTime = $scope.shiftStartTime;
			var escalationSetId = "";
			var taskTable = $scope.task.table;
			var taskSysId = $scope.task.sys_id;
			if ($scope.currentRota.isCustomEscalation && $scope.currentEscalationSet.sys_id)
				escalationSetId = $scope.currentEscalationSet.sys_id;
			if ($window.NOW.is_Notify || $window.NOW.is_Slack || $window.NOW.is_MobileNotif || $window.NOW.is_Teams) {
				// TODO: Write the logic to cache the data for contact preferences
				rosterEscPopupUtils.getUserContactPreferences(groupId, $scope.selectedEscalationLevelLevel + "", startTime, rotaId, escalationSetId, taskTable, taskSysId).then(function (response) {
					$scope.contactPreference = rosterEscPopupUtils.processContactPreferences(response, rotaId, userId);
					$scope.isUserPreferenceLoading = false;
				});
			} else 
				$scope.isUserPreferenceLoading = false;
			
		} else
			$scope.profilePreferenceTabConfig.selectedTab = $scope.profilePreferenceTabConfig.tabs[0];
	}
	
	$scope.getNextRotaEscalationPlan = function() {
		$scope.showingRotaIndex++;
		$scope.currentEscalationSet = "";
		setProfileTypeData({}); // reset selected profile
		var nextRotaDetails;
		if ($scope.showingRotaIndex == $scope.nextRotas.length) {
			var lastFetchedRota = $scope.nextRotas[$scope.nextRotas.length - 1];
			$scope.rotasLoading = true;
			rosterEscPopupUtils.getNextRotas($window.NOW.oc_esc_modal.groupId, lastFetchedRota.start).then(function(response) {
				var mappedNextRotas = {};
				$scope.nextRotas.forEach(function(rota) {
					mappedNextRotas[rota.rota_id + rota.start] = rota;
				});
				var filteredNextRotas = response.filter(function(rota) {
					if (mappedNextRotas[rota.rota_id + rota.start])
						return false;
					return true;
				});
				$scope.nextRotas = $scope.nextRotas.concat(filteredNextRotas);
				nextRotaDetails = $scope.nextRotas[$scope.showingRotaIndex];
				if (nextRotaDetails)
					$scope.loadModalData($window.NOW.oc_esc_modal.groupId, nextRotaDetails.rota_id, nextRotaDetails.start);
				$scope.rotasLoading = false;
			}, function() {
				$scope.rotasLoading = false;
			});
		} else {
			nextRotaDetails = $scope.nextRotas[$scope.showingRotaIndex];
			if (nextRotaDetails && nextRotaDetails.isCurrentTimeShift)
				$scope.loadModalData($window.NOW.oc_esc_modal.groupId, nextRotaDetails.rota_id, "");
			else
				$scope.loadModalData($window.NOW.oc_esc_modal.groupId, nextRotaDetails.rota_id, nextRotaDetails.start);
		}
	};

	$scope.getPrevRotaEscalationPart = function() {
		$scope.showingRotaIndex--;
		$scope.currentEscalationSet = "";
		var prevRotaDetails = $scope.nextRotas[$scope.showingRotaIndex];
		if (prevRotaDetails && prevRotaDetails.isCurrentTimeShift)
			$scope.loadModalData($window.NOW.oc_esc_modal.groupId, prevRotaDetails.rota_id, "");
		else
			$scope.loadModalData($window.NOW.oc_esc_modal.groupId, prevRotaDetails.rota_id, prevRotaDetails.start);
	};
	
	function getNextRotasList(groupId) {
		var dfd = $q.defer();
		$scope.rotasLoading = true;
		rosterEscPopupUtils.getNextRotas(groupId).then(function(response) {
			$scope.nextRotas = response;
			$scope.rotasLoading = false;
			dfd.resolve();
		}, function() {
			$scope.rotasLoading = false;
		});
		return dfd.promise;
	}
	
	$scope.focusLastElement = function(event) {
		if (event.shiftKey && event.keyCode == keys.tab) {
			var endElementSelector = "#end_of_dialog";
			var endEl = angular.element(endElementSelector)[0];
			var nextButton = angular.element(".oc-esc-path-next")[0];
			var prevButton = angular.element(".oc-esc-path-prev")[0];
			if (event.target == prevButton)
				endEl.focus();
			else if (event.target == nextButton) {
				if (prevButton.hasClassName("disabled"))
					endEl.focus();
			}
		}
	};
	
	$scope.focusFirstElement = function(event) {
		if (!event.shiftKey && event.keyCode == keys.tab) {
			var startElementSelector = ".oc-esc-path-next-prev";
			var startEl = angular.element(startElementSelector);
			var buttons = startEl.find("button");
			for(var index = 0; index < buttons.length; index++) {
				if (!buttons[index].hasClassName("disabled")) {
					buttons[index].focus();
					break;
				}
			}
		}
	};
	
	$scope.destroyModal = function(event) {
		$window.NOW.CustomEvent.fireAll('DismissOCGlideModal');
	};
	
	// Close modal of pressing the 'esc' key
	document.addEventListener("keyup", function(event) {
		if (event.keyCode === keys.esc)
			$scope.destroyModal(event);
	});

	// load content on modal after opening the popup for the first time
	var promises = {};
	promises.loadModalData = $scope.loadModalData($window.NOW.oc_esc_modal.groupId, $window.NOW.oc_esc_modal.rotaId, $window.NOW.oc_esc_modal.startDate);
	promises.getNextRotasList = getNextRotasList($window.NOW.oc_esc_modal.groupId);
	$q.all(promises).then(function() {
		organizeOverlappingRotas();
	});
	
	// Select profile and user contact preference tab on arrow key down events
	$scope.selectTab = function(event, tabToSelect) {
		if (event.keyCode == keys.leftKey || event.keyCode == keys.rightKey) {
			$timeout(function() {
				$scope.selectedProfilePrefTab = tabToSelect;
			});
		}
	};
});

angular.module("sn.on_call.esc_path").filter("memberfilter", [function() {
	return function(members, textMemberSearch) {
		if (!textMemberSearch)
			return members;

		var filteredMembers = [];
		members.forEach(function(member) {
			if (member.user && member.user.name && member.user.name.toLowerCase().indexOf(textMemberSearch.toLowerCase()) !== -1)
				filteredMembers.push(member);
		});
		return filteredMembers;
	};
}]);

angular.module("sn.on_call.esc_path").service("HighlightService", ["$sanitize", "$sce", function($sanitize, $sce) {
	var highlightService = this;

	highlightService.highlight = function(text, highlightText, highlightClass) {
		if (!highlightText || !highlightClass)
			return text;
		var cleanHighlightText = $sanitize(highlightText);
		var cleanHighlightClass = $sanitize(highlightClass);
		var pattern = new RegExp(cleanHighlightText, "gi");
		return $sce.trustAsHtml(text.replace(pattern, '<span class="' + cleanHighlightClass + '">$&</span>'));
	};
}]);

angular.module("sn.on_call.esc_path").service("slackService", function($http, $q, i18n, snNotification, $window) {
	var TYPE = {
			DANGER: "danger"
		};
	var MESSAGES = {
			TECH_ERROR: i18n.getMessage("Cannot connect to Slack due to technical error, please contact administrator."),
			SLACK_ERROR: i18n.getMessage("Slack account is not present for this user email id, please contact administrator.")
		};
	var CONSTANTS = {
			TIME: 5000
		};
	
	return {
		
		getSlackInfo: function(sys_id) {
			var deferred = $q.defer();
			var url = "/api/now/on_call_rota/slack/getUserInfo/" + sys_id;
			$http.get(url).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		},
		
		openSlackApp: function (sys_id) {
			this.getSlackInfo(sys_id).then(function (slackDetails) {
				if (slackDetails && slackDetails.status === "Success")
					$window.location.href = "slack://user?team=" + slackDetails.team_id + "&id=" + slackDetails.user_id;
				else if (slackDetails && slackDetails.status === "Error")
					snNotification.show(TYPE.DANGER,MESSAGES.SLACK_ERROR,CONSTANTS.TIME);
				else
					snNotification.show(TYPE.DANGER,MESSAGES.TECH_ERROR,CONSTANTS.TIME);
			}, function(){
				snNotification.show(TYPE.DANGER,MESSAGES.TECH_ERROR,CONSTANTS.TIME);
			});
		}
	};
});

angular.module("sn.on_call.esc_path").service("rosterEscPopupUtils", function($http, $q) {
	var isRightSectionLoading = true;
	return {
		onCallShifts: function(groupId, rotaId, startDate, escalationSetSysId, taskTable, taskSysId){
			var deferred = $q.defer();
			var url = "/api/now/on_call_rota/escalations?group_id=";
			url += groupId;
			if (rotaId)
				url += "&rota_id=" + rotaId;
			if (startDate)
				url += "&start_date=" + startDate;
			if (escalationSetSysId)
				url += "&escalation_set_sys_id=" + escalationSetSysId;
			if (taskTable)
				url += "&task_table=" + taskTable;
			if (taskSysId)
				url += "&task_sys_id=" + taskSysId;
			
			$http.get(url).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		},
		
		getNextRotas: function(groupId, startDate) {
			var deferred = $q.defer();
			if (!startDate)
				startDate = "";
			var params = "";
			params += groupId;
			params += "&start_date=" + startDate;
			var url = "/api/now/on_call_rota/getNextRotas?group_id=" + params;
			$http.get(url).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		},
		
		getUserContactPreferences: function (groupId, level, startTime, rotaId, escalationSetId, taskTableName, taskSysId) {
			var deferred = $q.defer();
			var url = "/api/now/on_call_rota/getUserContactPerAttemptPreferences/" + groupId;
			var queryParams = [];
			if (startTime)
				queryParams.push("start_time=" + startTime);
			if (rotaId)
				queryParams.push("rota_id=" + rotaId);
			if (level)
				queryParams.push("escalation_level=" + level);
			if (escalationSetId)
				queryParams.push("escalation_set_id=" + escalationSetId);
			if (taskTableName)
				queryParams.push("task_table_name=" + taskTableName);
			if (taskSysId)
				queryParams.push("task_sys_id=" + taskSysId);
			url += "?" + queryParams.join("&");
			$http.get(url).then(function(response) {
				deferred.resolve(response.data.result);
			}, function (error) {
				deferred.reject(error);
			});
			return deferred.promise;
		},
		
		getRightSectionLoadingStatus: function() {
			return isRightSectionLoading;
		},
		
		setRightSectionLoadingStatus: function(status) {
			isRightSectionLoading = status;
		},
		
		processContactPreferences: function(contactPreferences, rotaId, userId) {
			var preferences = [];
			for (var attempt = 0; attempt < contactPreferences.length; attempt++) {
				var preferenceAtAttempt = contactPreferences[attempt];
				if (preferenceAtAttempt.rota_id === rotaId && preferenceAtAttempt.type === "user" && preferenceAtAttempt.sys_id === userId) {
					var preference = {};
					preference.userContactPreference = preferenceAtAttempt.contact_preferences.concat(preferenceAtAttempt.user_preferences);
					preference.attempt = preferenceAtAttempt.contact_attempt;
					preference.preferenceSource = preferenceAtAttempt.preference_source;
					preference.teamsChatLink = preferenceAtAttempt && preferenceAtAttempt.teams_chat_link ? preferenceAtAttempt.teams_chat_link : '';
					
					if (preference.userContactPreference.length > 0)
						preferences.push(preference);
				}
			}
			return preferences;
		}
	};
});

angular.module("sn.on_call.esc_path").directive("snOncallAudienceProfile", function(getTemplateUrl, $window, i18n, avatarProfilePersister, $timeout, $http, $injector, slackService) {
	"use strict";
	return {
		restrict: "E",
		scope: {
			audienceDetail: "=",
			selectedProfile: "@",
			profileMap: "=",
			groupDetails: "="
		},
		templateUrl: getTemplateUrl("oc_audience_avatars.xml"),
		controller: function($scope, snConnectService, $element) {
			$scope.isChatEnabled = function() {
				return ($window.NOW.oc_esc_modal.chat_enabled === "true" && window.NOW.isPolarisEnabled !== 'true');
			};
			
			$scope.form = {};
			$scope.form.emailLabel = i18n.getMessage("Email");
			$scope.form.slackLabel = i18n.getMessage("Slack");
			$scope.form.teamsLabel = i18n.getMessage("Microsoft Teams");
			$scope.form.contactNumberLabel = i18n.getMessage("Contact number");
			$scope.form.sendDirectMsg = i18n.getMessage("Send a Direct Message");
			$scope.form.notAvailable = i18n.getMessage("Not Available");
			$scope.form.manager = i18n.getMessage("Manager");
			
			$scope.getEscalationMsg = function(groupName) {
				return i18n.format(i18n.getMessage("This step will involve escalating to {0} Group"), groupName);
			};
			
			$scope.getBackgroundStyle = function(user) {
				if (user && user.avatar && user.avatar !== "")
					return { "background-image": "url(" + user.avatar + ")" };
				if (user && user.name)
					return ""; // one-time watch (see angular doc)
				return void (0);
			};
			
			$scope.isSlackActive = window.NOW.is_Slack;
			$scope.isTeamsActive = window.NOW.is_Teams;
			
			$scope.openSlackApp = function (sys_id) {
				slackService.openSlackApp(sys_id);
			};
			
			if ($scope.audienceDetail && $scope.audienceDetail.user) {
				if ($scope.audienceDetail.user.sys_id && avatarProfilePersister.getAvatar($scope.audienceDetail.user.sys_id)) {
					$scope.audienceDetail = avatarProfilePersister.getAvatar($scope.audienceDetail.user.sys_id);
					$scope.$emit("sn-user-profile.ready");
				} else {
					var url = "/api/now/live/profiles/sys_user." + $scope.audienceDetail.user.sys_id;
					$http.get(url).then(function(response) {
						angular.merge($scope.audienceDetail, response.data.result);
						avatarProfilePersister.setAvatar($scope.audienceDetail.user.sys_id, $scope.audienceDetail);
						$scope.$emit("sn-user-profile.ready");
					});
				}
			}
			
			$scope.openDirectMessageConversation = function(evt) {
				if (evt && evt.keyCode === 9)
					return;

				$timeout(function() {
					if ($scope.audienceDetail && $scope.audienceDetail.user) {
						var audienceProfile = angular.copy($scope.audienceDetail);
						if (audienceProfile.user.name.display_value) 
							audienceProfile.user.name = $scope.audienceDetail.user.name.display_value;
						snConnectService.openWithProfile(audienceProfile.user);
					}
				}, 0, false);

				angular.element(".popover").each(function() {
					angular.element(this).remove();
				});
			};
			
			$scope.getMembersCount = function(count) {
				if (count == 1)
					return i18n.format(i18n.getMessage("{0} member"), count);
				else if(count > 1)
					return i18n.format(i18n.getMessage("{0} members"), count);
				else return "";
			};

			var notifyCallServiceProxy;
			if ($injector.has('notifyCallServiceProxy'))
				notifyCallServiceProxy = $injector.get('notifyCallServiceProxy');
			else if ($injector.has('notifyCallService'))
				notifyCallServiceProxy = $injector.get('notifyCallService');

			if (notifyCallServiceProxy) {
				$scope.isNotifyCallAvailable = notifyCallServiceProxy.isAvailable.bind(notifyCallServiceProxy);
				$scope.callPerson = notifyCallServiceProxy.call.bind(notifyCallServiceProxy);
				$scope.isNotifyCallEnabled = notifyCallServiceProxy.isOnline.bind(notifyCallServiceProxy);
				var dereg = notifyCallServiceProxy.registerCloseHandler(function () {
					$element.find('.oc-message-container.call button').focus();
				});
				$scope.$on('$destroy', function () {
					if (dereg)
						dereg();
				});
			}
		}
	};
});

angular.module("sn.on_call.esc_path").directive("showTooltipOnTextOverflow", [function() {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var elem = element[0];
			scope.$watch(
				function() {
					return elem.scrollWidth;
				},
				function() {
					var firstElem = element[0];
					if (firstElem.offsetWidth < firstElem.scrollWidth)
						attrs.tooltipEnable = "true";
				}
			);
		}
	};
}]);
angular.module("sn.on_call.esc_path").directive("snEscPathCustomSelect", ['i18n', '$timeout', 'keys',  function(i18n, $timeout, keys) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var config = {
				placeholder: i18n.getMessage('Select escalation set')
			};
			element.select2(config);
			element.on( 'select2-opening', function() {
				scope.opened = true;
			});
			element.on( 'select2-close', function() {
				$timeout(function() {
					scope.opened = false;
				}, 500);
			});
			angular.element('.select2-focusser').keyup(function(event) {
				if (event.keyCode == keys.esc && scope.opened) {
					event.stopImmediatePropagation();
				}
			});
			
			
		}
	};
}]);

angular.module("sn.on_call.esc_path").directive("snUserContactPreference", ['getTemplateUrl', 'rosterEscPopupUtils', 'keys', 'i18n', '$window', '$injector', 'slackService', function(getTemplateUrl, rosterEscPopupUtils, keys, i18n, $window, $injector, slackService) {
	return {
		restrict: "E",
		scope: {
			contactPreferenceDetails: "=",
			userPreferenceExtraDetails: "="
		},
		templateUrl: "oc_user_contact_prefereces.html",
		controller: function($scope,$element) {
			var preferenceSourceMap = {
				USER: "user",
				CONTACT: "contact",
				DEFAULT: "system",
				DEVICE: "device"
			};
			
			$scope.dataNotAvailable = i18n.getMessage("Not Available");
			if (!$scope.userPreferenceExtraDetails.startDateTimeDisplay)
				$scope.startTimeMessage = i18n.getMessage("Current contact preferences");
			else
				$scope.startTimeMessage = i18n.format(i18n.getMessage("Contact Preferences are as of {0}"), $scope.userPreferenceExtraDetails.startDateTimeDisplay);
			
			function getLabel(type) {
				var commTypes = $window.NOW.oc_esc_modal.communicationTypes;
				for (var index = 0; index < commTypes.length; index++) {
					if (commTypes[index].type.value === type)
						return commTypes[index].type.display_value;
				}
				return type;
			}
			
			$scope.getPreferenceSourceBadge = function (source) {
				switch(source) {
					case preferenceSourceMap.USER:
						return i18n.getMessage("Set by User");
					case preferenceSourceMap.CONTACT:
						return i18n.getMessage("Overriden by Shift Manager");
					case preferenceSourceMap.DEFAULT:
						return i18n.getMessage("System Default");
					default:
						return "";
				}
			};
			
			$scope.typeMap = {
				email: {
					label: getLabel("email"),
					valueField: "email" 
				},
				sms: {
					label: getLabel("sms"),
					valueField: "number"
				},
				voice: {
					label: getLabel("voice"),
					valueField: "number"
				},
				slack: {
					label: getLabel("slack"),
					valueField: "slack"
				},
				teams: {
					label: getLabel("teams"),
					valueField: "teams"
				},
				mobile_notification: {
					label: getLabel("mobile_notification"),
					valueField: "mobile_notification"
				}
			};
			
			$scope.openSlackApp = function (sys_id) {
				slackService.openSlackApp(sys_id);
			};
			
			var notifyCallServiceProxy;
			if ($injector.has('notifyCallServiceProxy'))
				notifyCallServiceProxy = $injector.get('notifyCallServiceProxy');
			else if ($injector.has('notifyCallService'))
				notifyCallServiceProxy = $injector.get('notifyCallService');

			if (notifyCallServiceProxy) {
				$scope.isNotifyCallAvailable = notifyCallServiceProxy.isAvailable.bind(notifyCallServiceProxy);
				$scope.callPerson = notifyCallServiceProxy.call.bind(notifyCallServiceProxy);
				$scope.isNotifyCallEnabled = notifyCallServiceProxy.isOnline.bind(notifyCallServiceProxy);
				var dereg = notifyCallServiceProxy.registerCloseHandler(function () {
					$element.find('.oc-message-container.call button').focus();
				});
				$scope.$on('$destroy', function () {
					if (dereg)
						dereg();
				});
			}
		}
	};
}]);
