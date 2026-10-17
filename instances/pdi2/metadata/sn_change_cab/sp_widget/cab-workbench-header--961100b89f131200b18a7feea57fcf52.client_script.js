function($scope, dataUtil, getController, CtrlIds, meetingUtil, i18n, $timeout, $filter, runtimeState, timerService, $window, CAB, TIME, $log, $element, spUtil, meetingAttendees, meetingAgenda, $uibModal, $q, loadWait) {
    var c = this;
	
	$scope.meetingAttendees = meetingAttendees;
	
	var htmlDialogContent = {  //Holds content references for HTML dialogs
		"cab-conference-info": null
	};
	
	var header = {
		"hasFocus": false,
		"focus": function() {
			header.hasFocus = true;
			$timeout(function(){
				header.hasFocus = false;
			});
		}
	};
	
	$scope.header = header;
	
	var meeting = {
		// Populated on init.
		"duration_label": "",
		"timer": null,
		"record": null,
		"runtimeState": null,
		
		"isPending": function() {
			return meeting.record && meeting.record.state.value === CAB.PENDING;
		},
		"isCancelled": function() {
			return meeting.record && meeting.record.state.value == CAB.CANCELED;
		},
		"start": function() {
			runtimeState.startMeetingAndSelectNextAgenda();
		},
		"canManage": function() {
			return runtimeState.isCABManager($scope.data.userId);
		},
		
		"canRequestHost": function() {
			return !runtimeState.isCABManager($scope.data.userId) && runtimeState.isCABManagerDelegate($scope.data.userId);
		},
		"requestHost": function() {
			if (!meeting.canRequestHost())
				return $q.reject("Cannot become host");
			
			meeting.hostRequested = true;
			
			return runtimeState.hostMeeting($scope.data.userId, meeting.record.sys_id.value)
			.then(function() {
				meeting.hostRequested = false;
				var unwatchCanRequestHost = $scope.$watch($scope.meeting.canRequestHost, function(canRequestHost) {
					if (canRequestHost)
						return;
					
					unwatchCanRequestHost();
					header.focus();
				});
			},
			function() {
				meeting.hostRequested = false;
			});
		},
		"hostRequested": false,
	};
	$scope.meeting = meeting;
	
	function updateDuration() {
		var actualStart = meeting.record.actual_start.value_ms;
		var meetingStart = meeting.record.start.value_ms;
		var meetingEnd = meeting.record.end.value_ms;
		
		if (actualStart && actualStart < meetingStart)
			meeting.timer.duration = meetingEnd - actualStart;
		else
			meeting.timer.duration = meetingEnd - meetingStart;
		
		meeting.duration_label = i18n.format(c.data.i18n.timer.scheduled_for, Math.ceil((meetingEnd - meetingStart)/TIME.MINUTE));
	};

	function updateElapsed() {
		if (meeting.timer.running)
			return;
		
		// Copmensate for differences between local time and server time.
		var now = $window.Date.now() - meeting.runtimeState.localState.time_offset;
		var actualStart = meeting.record.actual_start.value_ms;
		var actualEnd = meeting.record.actual_end.value_ms;
		var meetingStart = meeting.record.start.value_ms;
		var meetingEnd = meeting.record.end.value_ms;
		
		var checkpoint = actualEnd ? actualEnd : now; 
		
		if (actualStart && actualStart < meetingStart && actualStart < checkpoint) {
			meeting.timer.elapsed = checkpoint - actualStart;
			return;
		}
		
		if (meetingStart < checkpoint)
			meeting.timer.elapsed = checkpoint - meetingStart;
	};	
	
	function toggleFocus(element) {
		element.hasFocus = true;
		$timeout(function() {
			element.hasFocus = false;
		});
	}
	
	var popup = {
		"meetingNotes": {
			"hasFocus": false,
			"focus": function() {
				toggleFocus(popup.meetingNotes);
			},
			"onClick": function() {
				popup.openWidgetDialog('cab-meeting-notes')
				.then(
					popup.meetingNotes.focus,
					popup.meetingNotes.focus
				);
			}
		},
		"attendees": {
			"hasFocus": false,
			"focus": function() {
				toggleFocus(popup.attendees);
			},
			"onClick": function() {
				popup.openWidgetDialog('cab-attendees')
				.then(
					popup.attendees.focus,
					popup.attendees.focus
				);
			}
		},
		"conferenceInfo": {
			"hasFocus": false,
			"focus": function() {
				toggleFocus(popup.conferenceInfo);
			},
			"onClick": function() {
				popup.openHTMLDialog('cab-conference-info')
				.then(
					popup.conferenceInfo.focus,
					popup.conferenceInfo.focus
				);
			}
		},
		
		"openDialogCtrl": null,
		
		"openWidgetDialog": function(dialogId) {
			if (popup.openDialogCtrl)
				popup.openDialogCtrl.close();

			var dialogContent = {
				"title": $scope.data.i18n.dialogTitle[dialogId],
				"id": dialogId + "-modal",
				"widget": $scope.data.widgetDef[dialogId]
			};
		
			popup.openDialogCtrl = $uibModal.open({
				"animation": true,
				"ariaLabelledBy": dialogId + "-trigger",
				"backdrop": true,
				"controller": ["$scope", "$uibModalInstance", "$uibModalStack", "$log", function($scope, $uibModalInstance, $uibModalStack, $log) {
					var dlgCtrl = this;
					dlgCtrl.content = dialogContent;
					dlgCtrl.close = function() {
						$uibModalInstance.close();
					}
					
					dlgCtrl.modalBodyFocused = function(event) {
						$scope.$broadcast("modalBodyFocused", event);
					}
				}],
				"controllerAs": "dlgCtrl",
				"size": "cab-notes",
				"scope": $scope,
				"templateUrl": "cab-sp-widget-dialog"
			});
			return popup.openDialogCtrl.result;
		},
		
		"openHTMLDialog": function(dialogId) {
			if (popup.openDialogCtrl)
				popup.openDialogCtrl.close();
		
			var dialogContent = {
				"title": $scope.data.i18n.dialogTitle[dialogId],
				"id": dialogId + "-modal",
				"html": htmlDialogContent[dialogId].value
			};
		
			popup.openDialogCtrl = $uibModal.open({
				"animation": true,
				"ariaLabelledBy": dialogId + "-trigger",
				"backdrop": true,
				"controller": ["$scope", "$uibModalInstance", "$log", function($scope, $uibModalInstance, $log) {
					var dlgCtrl = this;
					dlgCtrl.content = dialogContent;
					dlgCtrl.close = function() {
						$uibModalInstance.close();
					}
					
					dlgCtrl.modalBodyFocused = function(event) {
						$scope.$broadcast("modalBodyFocused", event);
					}
				}],
				"controllerAs": "dlgCtrl",
				"scope": $scope,
				"templateUrl": "cab-html-dialog"
			});
			
			return popup.openDialogCtrl.result;
		},
	};
	$scope.popup = popup;
	
	var uaTimeout = null;
	function userAttending() {
		if (!uaTimeout)
			uaTimeout = $timeout(function() {
				meetingAttendees.userJoinedMeeting($scope.data.userId);
			}, 10000, false);
		return uaTimeout;
	}

	loadWait.register("header");
	// Init the widget data
	runtimeState.get($scope.data.meetingId)
	.then(function(runtimeState) {
		meeting.runtimeState = runtimeState;
		meeting.timer = timerService.getTimer($scope.data.meetingId);
		meeting.record = runtimeState.cab_meeting.record;
		htmlDialogContent['cab-conference-info'] = meeting.record.conference_details;
		updateDuration(); 

		//If the meeting has started
		if (meeting.record.state.value === CAB.IN_PROGRESS) {
			updateElapsed();
			meeting.timer.start();
		} else if (meeting.record.state.value === CAB.COMPLETE)
			updateElapsed();
		
		return meetingAttendees.get($scope.data.meetingId);
	})
	.then(function(attendeeUserIds) {
		if (meeting.record.state.value === CAB.IN_PROGRESS)
			userAttending();
		
		//Register watch on the meeting state
		$scope.$watch("meeting.record.state.value", function(newValue, oldValue) {
			if (newValue === CAB.IN_PROGRESS) {
				updateDuration();
				updateElapsed();
				meeting.timer.start();
				userAttending();
			}
			else if (newValue === CAB.COMPLETE) {
				meeting.timer.stop();
			}
		});
		
		return meetingAgenda.get($scope.data.meetingId);
	})
	.then(function() {
		loadWait.unregister("header");
	});
}
