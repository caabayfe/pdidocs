function($scope, CAB, runtimeState, timerService, meetingAgenda, approval, $uibModal, $log, i18n, $timeout, $q, spAuthModal, spUtil) {
	var c = this;
	var AC_ID = "cab-agenda-control";

	function runtimeStateAvailable() {
		return $scope.rs && $scope.rs.cab_meeting;
	}
	
	function popModal(templateUrl) {
		var modal = $uibModal.open({
			animation: true,
			controller: 'confirmApproval',
			size: 'cab-approval',
			templateUrl: templateUrl,
			scope: $scope
		});

		setTimeout(updateAriaLabel, 0);
		return modal.result;
	}
	
	function updateAriaLabel() {
		var containerDiv = document.getElementById("cab-select-approval-group");
		if (!containerDiv)
			return;

		var config = {
			childList: true,
			subtree: false,
			attributes: false,
			characterData: false,
		};

		var callback = function() {
			var ulField = containerDiv.getElementsByClassName('select2-results');
			if (ulField.length > 0) {
				ulField[0].setAttribute("aria-label", '${Approval groups}');
			}
		};

		var observer = new MutationObserver(callback);
		observer.observe(containerDiv, config);
	}

	function clearCurrentAgendaItem() {
		if ($scope.unwatchItemState)
			$scope.unwatchItemState();
		if ($scope.timer && $scope.timer.running)
			$scope.timer.stop();
		delete($scope.item);
		$scope.timer = null;
		$scope.approval = null;
		$scope.lastApproval = {};
	}

	function changeCurrentAgendaItem(itemId) {
		if (!itemId) {
			clearCurrentAgendaItem();
			return;
		}
		
		if ($scope.unwatchItemState)
			$scope.unwatchItemState();

		if ($scope.timer && $scope.timer.running)
			$scope.timer.stop();
		
		meetingAgenda.getAgendaItem(itemId)
		.then(function(agendaItem) {
			//If following the curent agenda item, change the view to the new current.
			if (!$scope.item || runtimeState.getViewAgendaItem() === $scope.item.sys_id.value)
				runtimeState.setViewAgendaItem(agendaItem.sys_id.value);
			
			$scope.item = agendaItem;
			$scope.timer = timerService.getTimer(agendaItem.sys_id.value);
			
			//Calculate the elapsed time if the item is in progress.
			if ($scope.item.state.value === CAB.IN_PROGRESS) {
				// Adjust now for differences between local time and server time.
				var now = Date.now() - $scope.rs.localState.time_offset;
				var then = $scope.rs.current_agenda_item_start.value_ms;
				var offset = now - then < 0 ? 0 : now - then;

				if (!agendaItem.elapsed_time.value_ms)
					agendaItem.elapsed_time.value_ms = 0;

				$scope.timer.elapsed = offset + $scope.item.elapsed_time.value_ms;
				$scope.timer.start();
			} else {
				$scope.timer.elapsed = $scope.item.elapsed_time.value_ms || 0;
			}
			
			//Add a watch to monitor changes in pause/unpause.
			$scope.unwatchItemState = $scope.$watch('item.state.value', function(newValue, oldValue) {
				if (newValue === CAB.PAUSED && oldValue === CAB.IN_PROGRESS && $scope.timer.running)
					$scope.timer.stop();
				else if (newValue === CAB.IN_PROGRESS && (oldValue === CAB.PAUSED || oldValue === CAB.PENDING) && !$scope.timer.running)
					$scope.timer.start();
			});
		},
		clearCurrentAgendaItem);
	}

	/**
	 * Checks if e-signature is required and reauthenitcates the user.
	 */
	function reauthenticateForApproval() {
		var eSignature = c.data.eSignature;
		if (!eSignature.isRequired)
			return $q.resolve();  //Just resolve if it's not required.

		return spAuthModal.prompt(eSignature, eSignature.username, eSignature.userSysId)
			.then(null, function(reason) {
				spUtil.addErrorMessage(c.data.i18n.eSignatureError);
				$log.error(reason);
			});
	}
	
	function toggleFocus(element) {
		element.hasFocus = true;
		$timeout(function() {
			element.hasFocus = false;
		});
	}
	
	var approvalCtrl = {
		"approve": {
			"hasFocus": false,
			"focus": function() {
				toggleFocus(approvalCtrl.approve);
			},
			"onClick": function() {
				reauthenticateForApproval()
				.then(function() {
					return popModal("cab-approve-pop");
				})
				.then(function(approvalDataObj) {
					$scope.lastApproval = {
						requiredUserApproval: true,
						approved: true
					};
					approvalCtrl.enabled = false;
					return approval.approve($scope.item.task.value, approvalDataObj.comment, approvalDataObj.approvalGroupSysID);
				})
				.then(
					function() {
						approvalCtrl.enable();
						agendaCtrl.current.focus();
					},
					function() {
						approvalCtrl.enable();
						approvalCtrl.approve.focus();
					}
				);
			}
		},
		"reject":  {
			"hasFocus": false,
			"focus" : function() {
				toggleFocus(approvalCtrl.reject);
			},
			"onClick": function() {
				reauthenticateForApproval()
				.then(function() {
					return popModal("cab-reject-pop");
				})
				.then(function(approvalDataObj) {
					$scope.lastApproval = {
						requiredUserApproval: true,
						rejected: true
					};
					approvalCtrl.enabled = false;
					return approval.reject($scope.item.task.value, approvalDataObj.comment, approvalDataObj.approvalGroupSysID);
				})
				.then(
					function() {
						approvalCtrl.enable();
						agendaCtrl.current.focus();
					},
					function() {
						approvalCtrl.enable();
						approvalCtrl.reject.focus();
					}
				);
			}
		},
		"enabled": true,
		"enable": function() {
			approvalCtrl.enabled = true;
		}
	};

	var agendaCtrl = { // Agenda navigation for the meeting
		"current": {
			"hasFocus": false,
			"focus": function() {
				toggleFocus(agendaCtrl.current);
				agendaCtrl.pause.hasFocus = false;
				agendaCtrl.resume.hasFocus = false;
			},
			"onClick": function() {
				if (!agendaCtrl.current.following())
					runtimeState.setViewAgendaItem($scope.rs.current_agenda_item.value);
			},
			"onKeypress": function(event) {
				if (agendaCtrl.current.following())
					return;
				
				var charCode = (typeof event.which === "number") ? event.which : event.keyCode;
				if (charCode === 13 || charCode === 32) {
					event.preventDefault();
					event.stopPropagation();
					runtimeState.setViewAgendaItem($scope.rs.current_agenda_item.value);
				}
			},
			"follow": function() {  // For convenience
				agendaCtrl.current.onClick();
			},
			"following": function() {
				return runtimeState.isViewingCurrent();
			}
		},
		"finish": { //Available when there are no pending agenda items
			"available": function() {
				return !meetingAgenda.hasMorePending();
			},
			"onClick": function($event) {
				if ($scope.approval.requiresApproval) {
					popModal("cab-finish-agenda-pop")
					.then(function() { // Only do something on 'OK'.
						return runtimeState.nextAgendaItem();
					})
					.then(
						agendaCtrl.enable,
						agendaCtrl.enable
					);
					return;
				}
				
				runtimeState.nextAgendaItem()
				.then(
					agendaCtrl.enable,
					agendaCtrl.enable
				);
			}
		},
		"next": { // Available when there are pending agenda items
			"hasFocus": false,
			"focus": function() {
				toggleFocus(agendaCtrl.next);
			},
			"available": function() {
				return meetingAgenda.hasMorePending();
			},
			"onClick": function($event) {
				agendaCtrl.enabled = false;
				if ($scope.approval.requiresApproval) {
					popModal("cab-skip-pop")
					.then(function() { // Only do something on 'OK'
						return meetingAgenda.getNextPendingAgendaItem();
					})
					.then(function(agendaItem) {
						return runtimeState.noDecisionNextAgendaItem(agendaItem.sys_id.value);
					})
					.then(
						function() {
							agendaCtrl.enable();
							agendaCtrl.current.focus();
						},
						function() {
							agendaCtrl.enable();
							agendaCtrl.next.focus();
						}
					)
					return;
				}
				
				// If no approval is required
				meetingAgenda.getNextPendingAgendaItem()
				.then(function(agendaItem) {
					return runtimeState.nextAgendaItem(agendaItem.sys_id.value)
				})
				.then(
					function() {
						agendaCtrl.enable();
						agendaCtrl.current.focus();
					},
					function() {
						agendaCtrl.enable();
						agendaCtrl.next.focus();
					}
				);
			}
		},
		"demote": {
			"available": function() {
				return meetingAgenda.hasMorePending();
			},
			"onClick": function($event) {
				agendaCtrl.enabled = false;
				meetingAgenda.getNextPendingAgendaItem()
				.then(function(agendaItem) {
					return runtimeState.demoteCurrentNextAgendaItem(agendaItem.sys_id.value);
				})
				.then(
					function() {
						agendaCtrl.enable();
						agendaCtrl.current.focus();
					},
					agendaCtrl.enable
				);  //Can't save using 'finally'
			}
		},
		"pause": {
			"hasFocus": false,
			"focus": function() {
				agendaCtrl.pause.hasFocus = true;
				agendaCtrl.resume.hasFocus = false;
			},
			"available": function() {
				return $scope.timer && $scope.timer.running;
			},
			"onClick": function(e) {
				agendaCtrl.enabled = false;
				runtimeState.pauseCurrentAgendaItem()
				.then(
					function() {
						agendaCtrl.enable();
						agendaCtrl.resume.focus();
					},
					function() {
						agendaCtrl.enable();
						agendaCtrl.pause.focus();
					}
				);
			}
		},
		"resume": {
			"hasFocus": false,
			"focus": function() {
				agendaCtrl.resume.hasFocus = true;
				agendaCtrl.pause.hasFocus = false;
			},
			"available": function() {
				return $scope.timer && !$scope.timer.running;
			},
			"onClick": function($event) {	
				agendaCtrl.enabled = false;
				runtimeState.resumeCurrentAgendaItem()
				.then(
					function() {
						agendaCtrl.enable();
						agendaCtrl.pause.focus();
					},
					function() {
						agendaCtrl.enable();
						agendaCtrl.resume.focus();
					}
				);
			}
		},
		"enabled": true,  // Flag used to disable controls if an action is being performed.
		"enable": function() {
			agendaCtrl.enabled = true;
		}
	};
	
	var meeting = {
		"start": function() {
			runtimeState.startMeetingAndSelectNextAgenda();
		},
		"end": {
			"hasFocus": false,
			"focus": function() {
				toggleFocus(meeting.end);
			},
			"onClick": function() {
				popModal("cab-end-meeting-pop")
				.then(
					function(){
						runtimeState.endMeeting();
					},
					function() {
						meeting.end.focus();
					}
				);
			},
			"available": function() {
				return meeting.host() && meeting.inProgress();
			}
		},
		"pending": function() {
			if (!runtimeStateAvailable())
				return false;
			return $scope.rs.cab_meeting.record.state.value == CAB.PENDING;
		},
		"inProgress": function() {
			if (!runtimeStateAvailable())
				return false;
			return $scope.rs.cab_meeting.record.state.value == CAB.IN_PROGRESS;
		},
		"canceled": function() {
			if (!runtimeStateAvailable())
				return false;
			return $scope.rs.cab_meeting.record.state.value == CAB.CANCELED;
		},
		"host": function() {
			if (!runtimeStateAvailable())
				return false;
			return runtimeState.isCABManager($scope.data.userId);
		},
	};
	
	var aria = {
		"currentAgendaItem": function () {
			if (!$scope.item || !$scope.item.task.display_value)
				return;
			return i18n.format(c.data.i18n.currentAgendaAriaLabel, $scope.item.task.display_value);
		},
		"scheduledTime": function () {
			if (!$scope.item || isNaN($scope.item.alotted_time.value_ms))
				return;
			return i18n.format(c.data.i18n.ariaScheduledTime, [parseInt($scope.item.alotted_time.value_ms/1000/60)]);
		}
	};
	
	// Add elements to the scope
	angular.extend($scope, {
		aria: aria,
		meeting: meeting,
		agendaCtrl: agendaCtrl,
		approvalCtrl: approvalCtrl,
		lastApproval: {
			requiredUserApproval: false,
			approved: false,
			rejected: false
		}
	});
	
	// Initial setup
	runtimeState.get($scope.data.meeting_id)
	.then(function(rs) {
		$scope.rs = rs;
		return meetingAgenda.get($scope.data.meeting_id);
	})
	.then(function(agenda) {
		$scope.agenda = agenda;  //This is now all retrieved items, not the entire agenda.
		
		$scope.$watch('rs.cab_meeting.record.state.value', function(state, prevState) {
			var unwatchCurrent = null;
			if (state === CAB.IN_PROGRESS) {
				unwatchCurrent = $scope.$watch('rs.current_agenda_item.value', function(itemId, prevItemId) {
					if (itemId && itemId !== "") {
						meetingAgenda.getAgendaItem(itemId)
						.then(function(agendaItem) {
							return approval.get(agendaItem.task.value);
						})
						.then(function(approvalModel) {
								$scope.lastApproval = {};
								$scope.approval = approvalModel;
						});
					}
					
					if (!itemId && prevItemId === runtimeState.getViewAgendaItem())
						runtimeState.setViewAgendaItem(null);
					
					changeCurrentAgendaItem(itemId);
					
					// If the meeting has just started and you're the host, switch to the current agenda item and focus.
					if (prevState === CAB.PENDING && state === CAB.IN_PROGRESS && meeting.host()) {
						agendaCtrl.current.follow();
						$timeout(function() {
							var currentAgendaItemWidget = document.getElementById("current-agenda-item-widget");
							if (currentAgendaItemWidget)
								currentAgendaItemWidget.focus();
						});
					}
				});
			}
			
			if (unwatchCurrent && state === CAB.COMPLETE)
				unwatchCurrent();

		});
	});
}
