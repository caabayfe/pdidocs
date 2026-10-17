window.NOW = window.NOW || {};
window.NOW.isPolarisEnabled = "${sn_ui.PolarisUI.isEnabled()}";
window.NOW.oc_live_esc_modal = window.NOW.oc_live_esc_modal || {};
window.NOW.oc_live_esc_modal.chat_enabled = "$[jvar_connect_installed_and_enabled]";
window.NOW.user_id = "$[jvar_user.getID()]";
window.NOW.oc_live_esc_modal.groupId = "$[JS:RP.getParameterValue('sysparm_group_id')]";
window.NOW.oc_live_esc_modal.task = {
	table: "$[JS:RP.getParameterValue('sysparm_task_table')]",
	sys_id: "$[JS:RP.getParameterValue('sysparm_task_sys_id')]"
};
window.g_ck = "$[gs.getSessionToken()]";
window.NOW.oc_live_esc_modal.communicationTypes = '$[JS:jvar_communication_types]';
window.NOW.oc_live_esc_modal.communicationTypes = JSON.parse(window.NOW.oc_live_esc_modal.communicationTypes);
window.NOW.oc_live_esc_modal.isRTL = textDirection;
window.NOW.oc_live_esc_modal.current_date_time = "$[new GlideDateTime().getDisplayValueInternal()]";
window.NOW.oc_live_esc_modal.is_Slack = '$[JS:jvar_use_slack_dm]' == 'true';
window.NOW.oc_live_esc_modal.is_Teams = '$[JS:jvar_use_msteams_dm]' == 'true';

angular.module("sn.on_call.live_esc", ["sn.common", "ui.bootstrap", "sn.on_call.live_esc.extra"]);

angular.module('sn.on_call.live_esc').constant('keys', {
	leftKey: 37,
	rightKey: 39,
	tab: 9,
	esc: 27
});

angular.module('sn.on_call.live_esc').config(function ($uibTooltipProvider) {
	var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;
	if (isTouchDevice) {
		var options = {
			trigger: 'none'
		};
		$uibTooltipProvider.options(options);
	}
});

angular.module("sn.on_call.live_esc").service('liveEscalationUtils', ['snRecordWatcher', function (snRecordWatcher) {
    var liveEscalation = this;
    var liveEscalationWatchers = {};
    liveEscalation.watchRecords = function (table, filter, callback) {
        var previousObserver = null;
        if (liveEscalationWatchers[table])
            previousObserver = liveEscalationWatchers[table];
        if (previousObserver)
            previousObserver.watcher.unsubscribe(previousObserver.callback);
        var watcher = snRecordWatcher.initList(table, filter);
        watcher.subscribe(function (response) {
            if (callback)
                callback(response);
        });

        liveEscalationWatchers[table] = {
            watcher: watcher,
            callback: callback
        };
    };

    liveEscalation.unsubscribeRecordsWatchers = function (tables) {
        for (var table in tables) {
            if (tables.hasOwnProperty(table) && liveEscalationWatchers[tables[table]] && liveEscalationWatchers[tables[table]].watcher)
                liveEscalationWatchers[tables[table]].watcher.unsubscribe(liveEscalationWatchers[tables[table]].callback);
        }
    };
    return liveEscalation;
}]);

angular.module("sn.on_call.live_esc").controller("ModalInstanceCtrl", function($scope, i18n, getTemplateUrl, $window, $timeout, $q, $http, keys, DataService, liveEscalationUtils) {
	$scope.modalInstanceCtrl = {};
	$scope.modalInstanceCtrl.groupDetails = {};
	$scope.modalInstanceCtrl.form = {};
	$scope.modalInstanceCtrl.form.close = i18n.getMessage("Close");
	$scope.modalInstanceCtrl.form.profile = i18n.getMessage("Profile");

	$scope.task = $window.NOW.oc_live_esc_modal.task;
	
	$scope.notification = {};
	$scope.notification.rotas = [];
	$scope.notification.visible = false;
	
	$scope.escalationPicker = {
		table: "on_call_escalation"
	};

	$scope.escalationAudiences = {
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
		selectedTab: "preference",
		tabs: ["profile", "preference"],
		tabsContainer: "profile-pref-tab-container"
	};
	
	$scope.responseType = {
		success: "success",
		error: "error"
	};
	
	$scope.escalateeType = {
		USER: 'user',
		DEVICE: 'device'
	};
	
	$scope.escalationStatus = {
		COMPLETE: 'complete',
		ACTIVE: 'active',
		PENDING: 'pending'
	};
	
	$scope.prefTypeMap = {
		email: {
			valueField: "email"
		},
		sms: {
			valueField: "number"
		},
		voice: {
			valueField: "number"
		},
		slack: {
			valueField: "email"
		},
		teams: {
			valueField: "teams"
		},
		mobile_notification: {
			valueField: "mobile_notification"
		},
		conference_escalation: {
			valueField: "conference_escalation"
		}
	};
	
	var TABLES = {
		ON_CALL_ESCALATION: 'on_call_escalation',
		ON_CALL_ESCALATION_LEVEL: 'on_call_escalation_level',
		ON_CALL_ESCALATION_CON_ATTEMPT: 'on_call_escalation_con_attempt',
		ON_CALL_ESCALATION_COMM: 'on_call_escalation_comm'
	};
	
	$scope.ERROR = {
		'NO_ESACALATIONS_FOUND': {
			message: i18n.getMessage("No live or past Escalations found")
		},
		'NO_SHIFTS_FOUND': {
			message: i18n.getMessage("No Shifts found for the Escalation")
		},
		'NO_ROTA_SELECTED': {
			message: i18n.getMessage("No Shift is selected")
		},
		'NO_LEVELS_FOUND': {
			message: i18n.getMessage("No Escalation Level found")
		},
		'NO_PROFILE_INFO_FOUND': {
			message: i18n.getMessage("No profile information available")
		}
	};
	
	function errorHandler(code) {
		if ($scope.ERROR[code]) {
			$scope.response.status = $scope.responseType.error;
			$scope.response.error_message = $scope.ERROR[code].message;
			$scope.loadingEscalationPlan = false;
			$scope.isContactInfoLoading = false;
			$scope.profile.selectedProfile = '';
		}
		// to do: log -  error
	}
	
	$scope.isRTL = $window.NOW.oc_live_esc_modal.isRTL === "rtl";
	$scope.modalTitle = i18n.format(i18n.getMessage("On-Call Escalation Tracking"));
	$scope.noEscalateeMsg = i18n.getMessage("No Escalatee");
	
	//-------------------- Escalation Path: Start ---------------------------//
	
	$scope.changeEscalation = function(escalationSysId) {
		if (escalationSysId) {
			$scope.escalationPicker.sys_id = escalationSysId;
			setPickerValue();		
		}
		$scope.loadModalData($scope.escalationPicker.sys_id);
	};

	function setPickerValue() {
		$timeout(function() {
			if ($scope.escalationPicker.sys_id) {
				var select2Box = angular.element('#escalation-dropdown');
				select2Box.val($scope.escalationPicker.sys_id).trigger('change');
				if (select2Box)
					select2Box.select2('focus');
				}
			});
	}
	
	function initEscalations() {
		$scope.escalations = [];
		$scope.currentEscalation = {};
		$scope.selectedRota = {};
		$scope.escalationPathLevelMap = {};
		$scope.escalationPicker = {};
	}
	
	initEscalations();
	
	function getEscalationsCallback(response) {
		$scope.response = {
			status: $scope.responseType.success
		};
		try {
			var initial =  !this.escalationSysId;
			validateResponse(response, initial);
			processResponse(response, initial);
			
		} catch(ex) {
			errorHandler(ex);	
		}
		$scope.loadingEscalationPlan = false;
		$scope.isContactInfoLoading = false;
	}
	
	function onError(response) {
		$scope.loadingEscalationPlan = false;
		$scope.isContactInfoLoading = false;
	}
	
	function getEscalationByIdCallback(response) {
		$scope.response = {
			status: $scope.responseType.success
		};
		$scope.currentEscalation = angular.copy(response);
		$scope.currentGroup = $scope.currentEscalation.group;
		// Reset selected rota
		if (response.shifts && response.shifts.length > 0) {
			if ($scope.selectedRota && $scope.selectedRota.sys_id) {
				$scope.selectedRota = $scope.currentEscalation.shifts.filter(function(shift) {
					return shift.sys_id.value === $scope.selectedRota.sys_id.value;
				})[0];
			} else {
				$scope.selectedRota = $scope.currentEscalation.shifts[0];
			}
		} else {
			$scope.selectedRota = undefined;
		}
		if ($scope.selectedRota) {
			if ($scope.selectedEscalationLevel && $scope.selectedEscalationLevel.sys_id)
				processEscalationLevels($scope.selectedEscalationLevel.sys_id.value);
			else
				processEscalationLevels();

			processOverlappingRotas();
		} else {
			errorHandler('NO_SHIFTS_FOUND');
			// Unsubscribe watchers for this escalation
			liveEscalationUtils.unsubscribeRecordsWatchers(TABLES);
		}
		setPickerValue();
		$scope.loadingEscalationPlan = false;
		$scope.isContactInfoLoading = false;
	}
	
	function getSelectedEscalation(escalations) {
		var filteredEscalations = [],result = [];
		if (escalations && escalations.length > 1) {
			filteredEscalations = escalations.filter(function(escalation) {
				return !!escalation.active;
			});
		}
		if (filteredEscalations.length == 0)
			filteredEscalations = escalations;
		
		// Find an escalation with assigned group if any
		result = filteredEscalations.filter(function(escalation) {
			return window.NOW.oc_live_esc_modal.groupId === escalation.group.sys_id.value;
		});
		
		// Return active or completed escalation with same assigned group
		if (result.length > 0)
			return result[0];
		
		if (filteredEscalations.length > 0)
			return filteredEscalations[0];
		
		return escalations[0];
	}

	$scope.getEscalationById = function(escalationSysId, fetchFromServer) {
		$scope.response = {
			status: $scope.responseType.success
		};
		$scope.isContactInfoLoading = true;
		$scope.loadingEscalationPlan = true;
		$scope.stepTimer = {};
		$scope.stepTimerMessage = '';
		if (fetchFromServer) {
			// Load from server
			DataService.getEscalationById(escalationSysId).then(getEscalationByIdCallback.bind(this), onError);
		} else	if ($scope.escalations) {
			// Load from cached data
			for(var i = 0; i < $scope.escalations.length; i++) {
				if ($scope.escalations[i].sys_id.value == escalationSysId) {
					$scope.currentEscalation = angular.copy($scope.escalations[i]);
					break;
				}
			}
			$scope.selectedRota = $scope.currentEscalation.shifts[0];
			$scope.currentGroup = $scope.currentEscalation.group;
			$scope.modalInstanceCtrl.groupDetails = $scope.currentGroup;
			if ($scope.selectedRota) {
				// Find and attach escalation audience for each level
				processEscalationLevels();
				processOverlappingRotas();
			} else {
				errorHandler('NO_SHIFTS_FOUND');
			}
			$scope.loadingEscalationPlan = false;
			$scope.isContactInfoLoading = false;
		}
		
	};
	
	$scope.refresh = function(type, fetchFromServer) {
		if (type === 'escalation') {
			$scope.getEscalationById($scope.currentEscalation.sys_id.value, fetchFromServer);
		} 
		else if (type === 'shift') {
			$scope.selectedEscalationLevel = {};
			$scope.getEscalationById($scope.currentEscalation.sys_id.value, fetchFromServer);
		}
	};
	
	$scope.loadModalData = function(escalationSysId) {
		$scope.loadingEscalationPlan = true;
		$scope.isContactInfoLoading = true;
		this.escalationSysId = escalationSysId || "";
		this.dfd = $q.defer();
		if (escalationSysId) {
			$scope.selectedRota = {};
			$scope.selectedEscalationLevel = {};
			$scope.getEscalationById(escalationSysId, $scope.activeFetch);
		}
		else
			DataService.getEscalations($scope.task.sys_id, $scope.task.table, '').then(getEscalationsCallback.bind(this), onError);
		
		return this.dfd.promise;
	};

	function debouncer(fn, escalationSysId, delay, debounceTimer) { 
		if (debounceTimer)
			clearTimeout(debounceTimer);
		return setTimeout(fn.bind(null, escalationSysId), delay);
	}

	function fetchEscalationById(escalationSysId) { 
		DataService.getEscalationById(escalationSysId).then(function (currentEscalation) {
			patchWatcherUpdates(currentEscalation);
		}, onError);
	}
	
	function patchWatcherUpdates(currentEscalation) {
		if (!currentEscalation)
			return;
		for (var i = 0; i < currentEscalation.shifts.length; i++) {
			if (currentEscalation.shifts[i].sys_id.value === $scope.selectedRota.sys_id.value) {
				var currentShiftEscalation = currentEscalation.shifts[i];
				currentShiftEscalation.escalation_levels.forEach(function(level) {
					var selectedShiftEscalationLevel;
					for (var i = 0; i < $scope.selectedRota.escalation_levels.length; i++) {
						if ($scope.selectedRota.escalation_levels[i].escalation_level === level.escalation_level) {
							selectedShiftEscalationLevel = $scope.selectedRota.escalation_levels[i];
							break;
						}
					}
					if (level.status !== $scope.escalationStatus.ACTIVE && selectedShiftEscalationLevel && selectedShiftEscalationLevel.isExpanded)
						level.isExpanded = true;
				});
				$scope.selectedRota = currentEscalation.shifts[i];
				processEscalationLevels(null, true);
				break;
			}
		}
	}

	function triggerRecordWatcher(escalation) {
		var escalationSysId = escalation.sys_id.value;
		var filter = "";
		var debounceTimer;
		if (!escalationSysId) return;
		filter = "contact_attempt.escalation_level.escalation=" + $scope.currentEscalation.sys_id.value + "^contact_attempt.escalation_level.rota=" + $scope.selectedRota.sys_id.value;
		liveEscalationUtils.watchRecords(TABLES.ON_CALL_ESCALATION_COMM, '', function (response) {
			if ((response.data.action === "entry" && response.data.operation === "insert") || (response.data.action === "change" && response.data.operation === "update"))
				debounceTimer = debouncer(fetchEscalationById, escalationSysId, 500, debounceTimer);
		});
		filter = "escalation_level.escalation=" + $scope.currentEscalation.sys_id.value + "^escalation_level.rota=" + $scope.selectedRota.sys_id.value;
		liveEscalationUtils.watchRecords(TABLES.ON_CALL_ESCALATION_CON_ATTEMPT, filter, function (response) {
			if (response.data.action === "entry" && response.data.operation === "insert")
				DataService.getEscalationById(escalationSysId).then(function (currentEscalation) {
					patchWatcherUpdates(currentEscalation);
				}, onError);
		});
		filter = "escalation=" + escalationSysId + "^rota=" + $scope.selectedRota.sys_id.value;
		liveEscalationUtils.watchRecords(TABLES.ON_CALL_ESCALATION_LEVEL, filter, function (response) {
			if (response.data.action === "entry" && response.data.operation === "insert") {
				$scope.isContactInfoLoading = true;
				DataService.getEscalationById(escalationSysId).then(function (currentEscalation) {
					patchWatcherUpdates(currentEscalation);
					$scope.isContactInfoLoading = false;
				}, onError);
			}
		});
		filter = "table=" + $scope.task.table + "^source=" + $scope.task.sys_id;
		liveEscalationUtils.watchRecords(TABLES.ON_CALL_ESCALATION, filter, function (response) {
			if (response.data.action === "change" && response.data.operation === "update" || (response.data.action === "entry" && response.data.operation === "insert"))
				DataService.getEscalationById(escalationSysId).then(function (currentEscalation) {
					patchWatcherUpdates(currentEscalation);
					$scope.currentEscalation.active = response.data.record.active && response.data.record.active.value === 'true';
					$scope.currentEscalation.status = currentEscalation.status;
				}, onError);
		});
	}
	
	function validateResponse(response, initial) {
		// Check escalations exist
		if (!response || !response.escalations || response.escalations.length == 0)
			throw 'NO_ESACALATIONS_FOUND';
		
		processEscalations(response, initial);
		
		// Check rotas exist
		if (!response.escalations[0].shifts || response.escalations[0].shifts.length == 0)
			throw 'NO_SHIFTS_FOUND';
	}
	
	function processEscalations(response, initial) {
		// Assign display value to escalations select list
		response.escalations.forEach(function(escalation) {
			if (!escalation.name && escalation.group && escalation.group.name)
				escalation.name =  escalation.start_time.display_value + ' - ' + escalation.group.name.display_value;
			
			if (escalation.active)
				$scope.activeFetch = true;
		});
		
		// Initialize scope variables
		if (initial) {
			$scope.escalations = response.escalations;
			$scope.currentEscalation = angular.copy(getSelectedEscalation($scope.escalations));
			$scope.escalationPicker.sys_id = $scope.currentEscalation.sys_id.value; 
		} else {
			$scope.currentEscalation = angular.copy(response.escalations[0]);
		}
		$scope.currentGroup = $scope.currentEscalation.group;
		$scope.modalInstanceCtrl.groupDetails = $scope.currentGroup;
		
		// Set default escalation value in picker on load
		setPickerValue();
	}
	
	function processResponse(response, initial) {
		processEscalations(response, initial);
		if (!$scope.currentEscalation || !$scope.currentEscalation.shifts)
			return;
		
		$scope.selectedRota = $scope.currentEscalation.shifts[0];
		
		// Find and attach escalation audience for each level
		processEscalationLevels();
		processOverlappingRotas();
	}
	
	function processOverlappingRotas () {
		// Show notification for overlapping rotas
		$scope.notification.rotas = getOverlappingRotas();
		if ($scope.notification.rotas && $scope.notification.rotas.length > 0) {
			$scope.notification.visible = true;
		} else
			$scope.notification.visible = false;
	}
	
	function getOverlappingRotas() {
		var result = [];
		if (!$scope.currentEscalation || !$scope.currentEscalation.shifts ||  !$scope.currentEscalation.shifts.length > 1)
			return result;
		if ($scope.selectedRota) {
			var rotas = $scope.currentEscalation.shifts.forEach(function(shift) {
				var rota = {};
				if (shift.sys_id.value != $scope.selectedRota.sys_id.value) {
						
					result.push({
							name: shift.name,
							sys_id: shift.sys_id,
							active: shift.active,
							is_custom_escalation: shift.is_custom_escalation
					});
				}
			});
		}
		return result;
	}
		
	function getRosterDetails(escalationLevel) {
		var rosterDetails = {};
		if (escalationLevel.escalation_type && escalationLevel.escalation_type.value == 'custom') {
			if (escalationLevel.custom_escalation_step)
				rosterDetails.name = escalationLevel.custom_escalation_step.display_value;
		} else {
			if (escalationLevel.roster)
				rosterDetails.name = escalationLevel.roster.display_value;
		}
		return rosterDetails;
	}
	
	function getEscalationLevelAudience(escalationLevel) {
		var result = {
			deviceDetails: [],
			groupDetails: [],
			userDetails: [],
		};
		if (escalationLevel && escalationLevel.contact_attempts && escalationLevel.contact_attempts.length > 0) {
			var communications = escalationLevel.contact_attempts[0].communications;
			if (communications)
				communications.forEach(function(communication) {
					switch(communication.escalatee_type.value) {
						case $scope.escalateeType.USER:     communication.user && !contains(result.userDetails, 'user', communication.user.sys_id) ? result.userDetails.push({user: communication.user}) : null;
															break;
						case $scope.escalateeType.DEVICE:   communication.device && !contains(result.deviceDetails, 'device', communication.device.sys_id.value)? result.deviceDetails.push(communication.device) : null;
															break;
					}
				});
		}
		return result;
	}
	
	function populateAdditionalEscalations(escalationLevel) {
		var groups = [];
		// Add groups
		if (escalationLevel.additional_escalations) {
			escalationLevel.additional_escalations.forEach(function(escalation) {
				escalation.group.isClickable = true;
				escalation.group.link_text = i18n.getMessage("Go to escalation");
				escalation.group.escalation_id = escalation.escalation_id;
				groups.push(escalation.group);
			});
		}
		if (escalationLevel && escalationLevel.escAudiences)
			escalationLevel.escAudiences.groupDetails = groups;
	}
	
	function contains(array, type, id) {
		if (type === 'user')
			return array.some(function(e) {
				return e.user.sys_id === id;
			});
		if (type === 'device')
			return array.some(function(e) {
				return e.sys_id.value === id;
			});
	}
	function processEscalationLevels(selectedLevelSysId, isTriggeredFromWatcher) {
		if (!$scope.selectedRota)
			throw 'NO_ROTA_SELECTED'; 

		if (!$scope.selectedRota.escalation_levels || $scope.selectedRota.escalation_levels.length == 0)
			throw 'NO_LEVELS_FOUND';
		
		// Sort escalation levels
		$scope.selectedRota.escalation_levels.sort(function(level1, level2) {
			return parseInt(level1.escalation_level) - parseInt(level2.escalation_level);
		});
		
		$scope.selectedEscalationLevel = $scope.selectedRota.escalation_levels[0];
		
		// Attach escalation audience per level
		$scope.selectedRota.escalation_levels.forEach(function(escalationLevel) {
			if (!escalationLevel.escAudiences)
				escalationLevel.escAudiences = getEscalationLevelAudience(escalationLevel);			
			
			if (escalationLevel.status !== $scope.escalationStatus.PENDING)
				populateAdditionalEscalations(escalationLevel);
			
			if (escalationLevel.status == $scope.escalationStatus.ACTIVE) {				
				$scope.selectedEscalationLevel = escalationLevel;
				escalationLevel.isExpanded = true;
				if (escalationLevel.timer) {
					$scope.stepTimer = escalationLevel.timer;
					$scope.stepTimerMessage = escalationLevel.timer_message;
				}
			}
			if (selectedLevelSysId && escalationLevel.sys_id && selectedLevelSysId === escalationLevel.sys_id.value)
				$scope.selectedEscalationLevel = escalationLevel;
			
			// Handle if one of overlapping shifts has completed
			if (escalationLevel.shift_completed)
				$scope.selectedRota.is_complete = true;
		});
		preProcessData($scope.selectedRota.escalation_levels, $scope.currentGroup);
		$scope.updateAvatarsPerLevel($scope.selectedEscalationLevel);
		
		if ($scope.selectedRota && !$scope.selectedRota.is_complete && !isTriggeredFromWatcher) {
			if ($scope.currentEscalation && $scope.currentEscalation.active)
				triggerRecordWatcher($scope.currentEscalation);
			else liveEscalationUtils.unsubscribeRecordsWatchers(TABLES);
				
		}
	}
	
	$scope.getAdditionalMembers = function(escAudience) {
		var additionalMembersCount = escAudience.userDetails.length + escAudience.deviceDetails.length + escAudience.groupDetails.length;
		if (!additionalMembersCount)
			additionalMembersCount = 0;
		return additionalMembersCount;
	};

	$scope.getLevelTitle = function(escalationLevel) {
		var name = "";
		var escAudience = escalationLevel.escAudiences;		
		var additionalMemberCount = $scope.getAdditionalMembers(escAudience) - 1;

		if (escAudience.userDetails.length > 0) {
			var userDetail = escAudience.userDetails[0].user;
			if (userDetail.name)
				name = userDetail.name.display_value;
			
		} else if (escAudience.groupDetails.length > 0) {
			var grpDetail = escAudience.groupDetails[0];
			if (grpDetail.name)
				name = grpDetail.name.display_value;
		} else if (escAudience.deviceDetails.length > 0) {
			var deviceDetail = escAudience.deviceDetails[0];
			if (deviceDetail.name)
				name = deviceDetail.name.display_value;
		}
		if (additionalMemberCount > 0)
			return name + " " + " +" + additionalMemberCount;
		
		if (!name)
			return $scope.noEscalateeMsg;
		
		return name;
	};
	
	$scope.showOverlappingRota = function(rota) {
		var rotaToSelect = $scope.currentEscalation.shifts.filter(function(shift) {
			return rota.sys_id.value == shift.sys_id.value;
		});
		$scope.selectedRota = rotaToSelect[0];
		$scope.refresh('shift', true);
	};
	
	function updateSelectedEscalationLevel (escalationLevel) {
		if ($scope.selectedEscalationLevel && escalationLevel && $scope.selectedEscalationLevel.escalation_level !== escalationLevel.escaltion_level) {
			$scope.selectedEscalationLevel.isFocused = false;
			escalationLevel.isFocused = true;
			$scope.selectedEscalationLevel = escalationLevel;
		}
	}
	
	$scope.expandNotifications = function(escalationLevel, $event) {
		if (!escalationLevel.isExpanded)
			$scope.updateAvatarsPerLevel(escalationLevel);
		
		escalationLevel.isExpanded = !escalationLevel.isExpanded;
		// to do: move the focus to first notification
		$event.currentTarget.focus();
	};
	
	//-------------------- Escalation Path: End ---------------------------//
	
	//-------------------- Profile Section: Start -------------------------//
	
	$scope.updateAvatarsPerLevel = function(escalationLevel) {
		if (!escalationLevel)
			throw 'NO_PROFILE_INFO_FOUND';

		setProfileTypeData(escalationLevel);
		$scope.escalationAudiences = escalationLevel.escAudiences;
		updateSelectedEscalationLevel(escalationLevel);
		$scope.selectedRosterName = escalationLevel.roster_details ? escalationLevel.roster_details.name : "";
		updateUserProfilePreference();
	};
	
	$scope.hasNoEscalatee = function() {
		return (
				!$scope.escalationAudiences ||  
				($scope.escalationAudiences.userDetails && $scope.escalationAudiences.userDetails.length === 0 &&
				$scope.escalationAudiences.deviceDetails && $scope.escalationAudiences.deviceDetails.length === 0 &&
				$scope.escalationAudiences.groupDetails && $scope.escalationAudiences.groupDetails.length === 0)
			);
	};
	
	function setProfileTypeData(escalationLevel) {
		var escalationAudiences = escalationLevel.escAudiences;
		if (escalationAudiences.userDetails.length > 0) {
			$scope.profile.selectedProfile = $scope.profile.profileTypeMap.user;
			$scope.profile.profileData = escalationAudiences.userDetails[0];
		} else if (escalationAudiences.groupDetails.length > 0) {
			$scope.profile.selectedProfile = $scope.profile.profileTypeMap.group;
			$scope.profile.profileData = escalationAudiences.groupDetails[0];
		} else if (escalationAudiences.deviceDetails.length > 0) {
			$scope.profile.selectedProfile = $scope.profile.profileTypeMap.device;
			$scope.profile.profileData = escalationAudiences.deviceDetails[0];
		}
		else {
			$scope.profile.selectedProfile = "";
			$scope.profile.profileData = {};
		}
	}
	
	function processUserDetails(userDetails, groupDetails) {
		return userDetails.forEach(function (userDetail) {
			if (groupDetails.manager && userDetail.user.sys_id === groupDetails.manager.value)
				userDetail.isManager = true;
			else
				userDetail.isManager = false;
			if (userDetail.user && userDetail.user.name && !userDetail.user.name.display_value) {
				userDetail.user.name = {
					display_value: userDetail.user.name
				};
			}
		});
	}
	
	function processDeviceDetails(deviceDetails) {
		deviceDetails.forEach(function(device) {
			device.type.display_value = i18n.format(i18n.getMessage("Type: {0}"), device.type.display_value);
			device.email_address.display_value = i18n.format(i18n.getMessage("Email: {0}"), device.email_address.display_value);
			device.phone_number.display_value = i18n.format(i18n.getMessage("Phone number: {0}"), device.phone_number.display_value);
		});
	}
	
	function preProcessData(escalationLevels, groupDetails) {
		escalationLevels.forEach(function(escDetail) {
			if (escDetail.escAudiences) {
				processUserDetails(escDetail.escAudiences.userDetails, groupDetails);
				processDeviceDetails(escDetail.escAudiences.deviceDetails);
			}
		});
	}
	
	$scope.getBackgroundStyle = function (avatarDetails) {
		if(avatarDetails)
			return { "background-image": "url(" + avatarDetails.user.avatar + ")" };
		return "";
	};
	
	$scope.updateProfileDetails = function(profileData, profileType) {
		$scope.profile.profileData = profileData;
		$scope.profile.selectedProfile = profileType;
		updateUserProfilePreference();
	};
	
	//-------------------- Profile Section: End ---------------------------//
	
	//-------------------- Contacted At Section: Start --------------------//
	
	$scope.showContactInformation = function() {
		return $scope.profile.profileTypeMap.user === $scope.profile.selectedProfile || $scope.profile.profileTypeMap.device === $scope.profile.selectedProfile;
	};
	
	function updateUserProfilePreference () {
		if ($scope.profile.profileTypeMap.user === $scope.profile.selectedProfile) {			
			$scope.userPreferenceExtraDetails = {};
			$scope.userPreferenceExtraDetails.rosterName = $scope.selectedRosterName;
			$scope.userPreferenceExtraDetails.userId = $scope.profile.profileData.user.sys_id;
			$scope.userPreferenceExtraDetails.userName = $scope.profile.profileData.user.name.display_value;
			$scope.userContactAttempts = getContactAttempts($scope.selectedEscalationLevel, $scope.profile.profileData.user.sys_id);
			$scope.userPreferenceExtraDetails.delegatorId = $scope.profile.profileData.user.delegator;
			$scope.userPreferenceExtraDetails.delegatorName = $scope.profile.profileData.user.delegator.name;

		} else if ($scope.profile.profileTypeMap.device === $scope.profile.selectedProfile) {
			$scope.userPreferenceExtraDetails = {};
			$scope.userPreferenceExtraDetails.rosterName = $scope.selectedRosterName;
			$scope.userPreferenceExtraDetails.userId = $scope.profile.profileData.sys_id.value;
			$scope.userPreferenceExtraDetails.userName = $scope.profile.profileData.name.display_value;
			$scope.userContactAttempts = getContactAttempts($scope.selectedEscalationLevel, $scope.profile.profileData.sys_id.value);
		} else if ($scope.profile.profileTypeMap.group === $scope.profile.selectedProfile) {
			$scope.profilePreferenceTabConfig.selectedTab = $scope.profilePreferenceTabConfig.tabs[0];
		}
		else {
			$scope.profilePreferenceTabConfig.selectedTab = $scope.profilePreferenceTabConfig.tabs[1];
		}
	}
	
	function getContactAttempts(escalationLevel, sysId) {
		var contact_attempts = [];
		if (escalationLevel.contact_attempts) {
			// Process complete or active attempts
			escalationLevel.contact_attempts.forEach(function(attempt) {
				var contactAttempt = {
					attempt: attempt.contact_attempt,
					status: attempt.status,
					escalation_level_status: escalationLevel.status,
					communications: []
				};
				if (attempt.acknowledged) {
					contactAttempt.acknowledged = attempt.acknowledged;
				}
				if (attempt.communications) {
					contactAttempt.communications = attempt.communications.filter(function(comm) {
						if ($scope.profile.selectedProfile == comm.escalatee_type.value) {
							if (comm.communication_type.value === 'conference_escalation') {
								if (comm.conference_service_provider && comm.conference_service_provider.display_value) 
									comm.contacted_at = i18n.format(i18n.getMessage('{0} - Conference escalation'), comm.conference_service_provider.display_value);
								else 
									comm.contacted_at = i18n.getMessage('Conference escalation');
							}
							if (comm.communication_type.value === 'email' && comm.email)
								comm.contacted_at = comm.email.display_value;
							
							if (comm.communication_type.value === 'slack' && comm.email)
								comm.contacted_at = comm.email.display_value;
							
							if ((comm.communication_type.value === 'voice' || comm.communication_type.value === 'sms') && comm.phone_number)
								comm.contacted_at = comm.phone_number.display_value;
		
							if (comm.communication_type.value === 'mobile_notification')
								comm.contacted_at = i18n.getMessage('Mobile push');
							
							if (comm.communication_type.value === 'teams')
								comm.contacted_at = i18n.getMessage('Microsoft Teams');
							
							if (comm.communication_type.value === 'task')
								comm.contacted_at = i18n.getMessage('Notified on Task');
							
							if (comm.communication_type.value !== 'email' && comm.communication_type.value !== 'slack' && comm.communication_type.value !== 'voice' && comm.communication_type.value !== 'sms' && comm.communication_type.value !== 'mobile_notification' && comm.communication_type.value !== 'teams' && comm.communication_type.value !== 'task' && comm.communication_type && comm.communication_type.display_value)
								comm.contacted_at = comm.communication_type.display_value;
								
							if (comm.escalatee_type.value == $scope.profile.profileTypeMap.user && comm.user)
								return sysId == comm.user.sys_id;
							
							if (comm.escalatee_type.value == $scope.profile.profileTypeMap.device && comm.device)
								return sysId == comm.device.sys_id.value;
						}
						return false;
					});
				}
				contact_attempts.push(contactAttempt);
			});
		}
		
		// Sort attempts
		contact_attempts.sort(function(attempt1, attempt2) {
			return parseInt(attempt1.attempt) - parseInt(attempt2.attempt);
		});
		
		processPendingContactAttempts(escalationLevel, contact_attempts, sysId);
		
		return contact_attempts;
	}
	
	function processPendingContactAttempts(escalationLevel, contact_attempts, sysId) {
		if (escalationLevel.status == $scope.escalationStatus.COMPLETE || !escalationLevel.pending_preferences)
			return contact_attempts;
		
		var lastAttempt;
		if (contact_attempts && contact_attempts.length > 0)
			lastAttempt = contact_attempts[contact_attempts.length - 1];
		
		var next = lastAttempt ? parseInt(lastAttempt.attempt) + 1 : 1;
		var remainingAttempts = escalationLevel.pending_preferences.filter(function(elem) {
			return (elem.contact_attempt >= next && $scope.profile.selectedProfile == elem.type && elem.sys_id == sysId);
		});
		
		remainingAttempts.sort(function(attempt1, attempt2) {
			return parseInt(attempt1.contact_attempt) - parseInt(attempt2.contact_attempt);
		});
		remainingAttempts.forEach(function(pendingAttempt) {
			pendingAttempt.attempt = pendingAttempt.contact_attempt;
			pendingAttempt.status = $scope.escalationStatus.PENDING;
			if (pendingAttempt.override_user_contact_preference || !pendingAttempt.user_preferences || !pendingAttempt.user_preferences.length) pendingAttempt.contact_preferences = getUniquePreferences(pendingAttempt.rota_preferences, []);
			else pendingAttempt.contact_preferences = getUniquePreferences([], pendingAttempt.user_preferences);
			
			contact_attempts.push(pendingAttempt);
		});
	}
	
	function getUniquePreferences(contactPrefs, userPrefs) {
		contactPrefs = contactPrefs.concat(userPrefs);
        for (var i = 0; i < contactPrefs.length; ++i) {
            for(var j = i + 1; j < contactPrefs.length; ++j) {
                if(contactPrefs[i].type === contactPrefs[j].type) {
					var type_i = contactPrefs[i].type;
					var type_j = contactPrefs[j].type;
					var valueField_i = $scope.prefTypeMap[type_i] ? ($scope.prefTypeMap[type_i].valueField || type_i) : type_i;
					var valueField_j = $scope.prefTypeMap[type_j] ? ($scope.prefTypeMap[type_j].valueField || type_j) : type_j;
					var value_i = contactPrefs[i][valueField_i];
					var value_j = contactPrefs[j][valueField_j];
					if (value_i == value_j)
						contactPrefs.splice(j--, 1);
				}
            }
        }
		return contactPrefs;
	}
	
	//-------------------- Contacted At Section: End ----------------------//
	
	// load content on modal after opening the popup for the first time
	var promises = {};
	promises.loadModalData = $scope.loadModalData();

	// ------------------- Accessibility Handling: Start ------------------ //
	
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
	
	$scope.focusLastElement = function(event) {
		if (event.shiftKey && event.keyCode == keys.tab) {
			var endElementSelector = "#end_of_dialog";
			var endEl = angular.element(endElementSelector)[0];	
			endEl.focus();
		}
	};
	
	$scope.focusFirstElement = function(event) {
		if (!event.shiftKey && event.keyCode == keys.tab) {
			var startElementSelector = ".modal-header";
			var startEl = angular.element(startElementSelector);
			var button = startEl.find("button")[0];
			if (button)
				button.focus();
		}
	};
	
	$scope.destroyModal = function(event) {
		$window.NOW.CustomEvent.fireAll('DismissOCLiveGlideModal');
	};
	
	// Close modal of pressing the 'esc' key
	document.addEventListener("keyup", function(event) {
		if (event.keyCode === keys.esc)
			$scope.destroyModal(event);
	});
	
	// Unsubscribe all the record watchers
	$window.NOW.CustomEvent.observe('oc_live_esalation.before_modal_close', function(){
		liveEscalationUtils.unsubscribeRecordsWatchers(TABLES);
	});
	
	// Select profile and user contact preference tab on arrow key down events
	$scope.selectTab = function(event, tabToSelect) {
		if (event.keyCode == keys.leftKey || event.keyCode == keys.rightKey) {
			$timeout(function() {
				$scope.selectedProfilePrefTab = tabToSelect;
			});
		}
	};

	// ------------------- Accessibility Handling: End ------------------ //
});

angular.module("sn.on_call.live_esc").service("slackService", function($http, $q, i18n, snNotification, $window) {
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

angular.module("sn.on_call.live_esc").service("DataService", function($http, $q) {
	return {
		getEscalations: function(source, table, groupId, filter) {
			var deferred = $q.defer();
			var url = "/api/now/on_call_rota/getEscalations?source=";
			url += source;
			url += "&table=" + table;
			if (groupId)
				url += "&group_id=" + groupId;
			
			$http.get(url).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		},
		
		getEscalationById: function(escalationSysId) {
			var deferred = $q.defer();
			var url = "/api/now/on_call_rota/getEscalationById?escalation_sys_id=" + escalationSysId;
			$http.get(url).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		},
		
		getEscalationPath: function(rotaId, escalationSetSysId) {
			var deferred = $q.defer();
			var url = "/api/now/on_call_rota/escalation_path?";
			if (rotaId)
				url += "rota_id=" + rotaId + "&";
			
			if (escalationSetSysId)
				url += "escalation_set_sys_id=" + escalationSetSysId;
			
			$http.get(url).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		}
	};
});

angular.module("sn.on_call.live_esc").directive("snOncallAudienceProfile", function(getTemplateUrl, $window, i18n, avatarProfilePersister, $timeout, $http, $injector, slackService) {
	"use strict";
	return {
		restrict: "E",
		scope: {
			audienceDetail: "=",
			selectedProfile: "@",
			profileMap: "=",
			groupDetails: "=",
			onClick: "="
		},
		templateUrl: getTemplateUrl("oc_audience_avatars.xml"),
		link: function (scope, element, attrs) {
				scope.callback =  function() {
					scope.onClick()(scope.audienceDetail.escalation_id);
				};
        },
		controller: function($scope, snConnectService, $element) {
			$scope.isChatEnabled = function() {
				return ($window.NOW.oc_live_esc_modal.chat_enabled === "true" && $window.NOW.isPolarisEnabled !== 'true');
			};
			
			$scope.isSlackActive = window.NOW.oc_live_esc_modal.is_Slack;
			$scope.isTeamsActive = window.NOW.oc_live_esc_modal.is_Teams;
			
			$scope.form = {};
			$scope.form.emailLabel = i18n.getMessage("Email");
			$scope.form.slackLabel = i18n.getMessage("Slack");
			$scope.form.teamsLabel = i18n.getMessage("Microsoft Teams");
			$scope.form.contactNumberLabel = i18n.getMessage("Contact number");
			$scope.form.sendDirectMsg = i18n.getMessage("Send a direct message");
			$scope.form.notAvailable = i18n.getMessage("Not Available");
			$scope.form.manager = i18n.getMessage("Manager");
			
			$scope.getEscalationMsg = function(groupName) {
				return i18n.format(i18n.getMessage("This step involves escalation to {0} Group"), groupName);
			};

			$scope.getBackgroundStyle = function(user) {
				if (user && user.avatar && user.avatar !== "")
					return { "background-image": "url(" + user.avatar + ")" };
				if (user && user.name)
					return ""; // one-time watch (see angular doc)
				return void (0);
			};
			
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

angular.module("sn.on_call.live_esc").directive("showTooltipOnTextOverflow", [function() {
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

angular.module("sn.on_call.live_esc").directive("snEscalationSelect", ['i18n', '$timeout', 'keys',  function(i18n, $timeout, keys) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var config = {
				placeholder: i18n.getMessage('Select escalation')
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

angular.module("sn.on_call.live_esc").directive("snUserContactPreference", ['getTemplateUrl', 'keys', 'i18n', '$window', '$injector', function(getTemplateUrl, keys, i18n, $window, $injector) {
	return {
		restrict: "E",
		scope: {
			contactPreferenceDetails: "=",
			userPreferenceExtraDetails: "=",
			escalationLevel: "="
		},
		templateUrl: "oc_user_contact_prefereces.html",
		controller: function($scope) {
			var preferenceSourceMap = {
				USER: "user",
				CONTACT: "contact",
				DEFAULT: "system",
				DEVICE: "device"
			};
			
			$scope.dataNotAvailable = i18n.getMessage("Not Available");
			
			$scope.isAttemptPending = function(attempt) {
				return attempt.status && attempt.status == 'pending';
			};
			
			$scope.isAttemptComplete = function(attempt, isLast) {
				return (attempt && attempt.escalation_level_status != 'active') || !isLast;
			};
			
			$scope.isAttemptActive = function(attempt) {
				return attempt.status && attempt.status == 'active'; //status != 'complete'
			};
			
			$scope.isEscalationLevelComplete = function() {
				return $scope.escalationLevel && $scope.escalationLevel.status == 'complete';
			};
			
			function getLabel(type) {
				var commTypes = $window.NOW.oc_live_esc_modal.communicationTypes;
				for (var index = 0; index < commTypes.length; index++) {
					if (commTypes[index].value === type)
						return commTypes[index].name;
				}
				return type;
			}
			
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
					},
					conference_escalation: {
						label: getLabel("conference_escalation"),
						valueField: "conference_escalation"
					},
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

angular.module("sn.on_call.live_esc").directive("snTimeTicker", ['getTemplateUrl', '$interval', 'i18n', '$window', '$injector', function (getTemplateUrl, $interval, i18n, $window, $injector) {
    return {
        restrict: "E",
        scope: {
            from: "=",
            to: "=",
            format: "@",
            direction: '@',
            showIndicators: '@',
            tick: '=',
			label: "="
        },
        templateUrl: "oc_esc_time_ticker.html",
        controller: function ($scope) {
            var current_date_time_ticker = new moment($window.NOW.oc_live_esc_modal.current_date_time);
            var prev = Date.now();			
			
            setInterval(function () {
                var curr = Date.now();
                current_date_time_ticker.add(curr - prev, 'ms');
                prev = curr;
                $window.NOW.oc_live_esc_modal.current_date_time = current_date_time_ticker.format('YYYY-MM-DD HH:mm:ss');
            }, 1000);

            var from = new moment($scope.from).valueOf();
            $scope.timer = {};
			$scope.tooltip = i18n.format(i18n.getMessage("{0}"), $scope.label);
            function updateTime() {
                var to;
                if (!$scope.tick && $scope.to)
                    to = new moment($scope.to).valueOf();
                else
                    to = current_date_time_ticker.valueOf();

                var difference;
                if ($scope.direction == 'future') {
                    difference = from - to;
                } else {
                    difference = to - from;
                }
                if (difference < 0) {
                    $scope.negativeDifference = true;
                } else {
                    $scope.negativeDifference = false;
                }
                var totalSeconds = difference / 1000;
                totalSeconds = Math.abs(totalSeconds);

                $scope.timer.days = formatNumber(Math.floor(totalSeconds / 60 / 60 / 24));
                $scope.timer.hours = formatNumber(Math.floor(totalSeconds / 60 / 60) % 24);
                $scope.timer.minutes = formatNumber(Math.floor(totalSeconds / 60) % 60);
                $scope.timer.seconds = formatNumber(Math.floor(totalSeconds % 60));
            }
            function formatNumber(number) {
                if (!isNaN(number))
                    number = Math.round(number);
                else
                    number = 0;

                if (number > 9)
                    return number;
                return "0" + number;
            }
            $scope.getTime = function () {
				if ($scope.timer.days == "00") {
                    return i18n.format('{0}:{1}:{2}', [$scope.timer.hours, $scope.timer.minutes, $scope.timer.seconds]);
                }
                else {
                    return i18n.format('{0}:{1}:{2}:{3}', [$scope.timer.days, $scope.timer.hours, $scope.timer.minutes, $scope.timer.seconds]);
                }
            };
            $scope.$watch('from', function (newValue) {
                from = new moment(newValue).valueOf();
                updateTime();
            });
            $scope.$watch('to', function (newValue) {
                updateTime();
            });
            var intervalInstance;
            $scope.$watch('tick', function (newValue) {
                if ($scope.tick)
                    intervalInstance = $interval(function () {
                        updateTime();
                    }, 1000);
                else if (intervalInstance) {
                    $interval.cancel(intervalInstance);
                    updateTime();
                }
            });
            updateTime();
        }
    };
}]);
