function($scope, runtimeState, meetingAgenda, agendaNotification, agendaItemFilterFilter, CAB, i18n, $uibModal, isAccessibilityEnabled, $timeout, loadWait) {
	var c = this;
	
	var modalConfig = {
		animation: true,
		controller: ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
						$scope.ok = function() {
							$uibModalInstance.close();
						};
						$scope.cancel = function() {
							$uibModalInstance.dismiss('cancel');
						};
		}]
	};

	$scope.CAB = CAB;
	
	var meeting = {
		"state": null,
		"record": null,
		"agenda": [],
		"agendaRWMod": null,
		"accessible": isAccessibilityEnabled(),
		"displayStartPopup": false,
		
		"start": function() {
			runtimeState.startMeetingAndSelectNextAgenda();
		},
		"showStartPopup": function(agendaItem) {
			if (!meeting.displayStartPopup)
				return $q.reject();

			modalConfig.templateUrl = "cab-start-meeting-pop";
			var modal = $uibModal.open(modalConfig);
			
			return modal.result.then(
				function() {
					meeting.displayStartPopup = false;
					runtimeState.startMeetingAndSelectNextAgenda();
				},
				function() {
					meeting.displayStartPopup = false;
				}
			);
		},
		"viewing": function(item) {
			return (item.sys_id.value === runtimeState.getViewAgendaItem());
		},
		"viewingCurrent": function() {
			return runtimeState.isViewingCurrent();
		},
		"pending": function() {
			if (meeting.state === null || meeting.record === null)
				return false;
			return meeting.record.state.value == CAB.PENDING;
		},
		"canceled": function() {
			if (meeting.state === null || meeting.record === null)
				return false;
			return meeting.record.state.value == CAB.CANCELED;
		},
		"host": function() {
			return runtimeState.isCABManager($scope.data.userId);
		}
	};
	$scope.meeting = meeting;
	
	var page = {
		"num": 0,
		"items": [],
		"loading": true,
		"handleNextClicked": false,
		
		"focusContainer": function () {
			$timeout(function() {
				document.getElementById("pending-agenda-item-widget").focus({"preventScroll": true});
			});
		},
		
		"refreshItems" : function() {
			page.items = agendaItemFilterFilter(meeting.agenda, $scope.selectedItem, $scope.data.userId, page.num);
		},
		"next": {
			"hasFocus": false,
			"focus": function() {
				page.next.hasFocus = true;
				$timeout(function() {
					page.next.hasFocus = false;
				});
			},
			"onClick": function(event) {
				page.num++;
				page.handleNextClicked = true;
				
				// In a timeout to push it to the end of the digest
				// It needs to do everything else before we can determine correct state.
				$timeout(function() {
					if (page.loading)
						return;
					
					if (page.next.available())
						page.next.focus();
					else
						page.focusContainer();
					
					page.handleNextClicked = false;
				});
			},
			"available": function() {
				var availableItems = meetingAgenda.countLoadedItems($scope.selectedItem, $scope.data.userId);
				var currentRequiredItems = ($scope.page.num + 1) * CAB.AGENDA.PAGE_SIZE;
				if (availableItems > currentRequiredItems || meetingAgenda.hasMoreToRequest($scope.selectedItem, $scope.data.userId))
					return true;
				
				return false;
			}
		},
		"top": {
			"onClick": function(event) {
				$scope.page.num = 0;
				page.focusContainer();
			},
			"available": function() {
				return $scope.page.num > 0;
			}
		},
		"prev": {
			"hasFocus": false,
			"focus": function() {
				page.prev.hasFocus = true;
				$timeout(function() {
					page.prev.hasFocus = false;
				});
			},
			"onClick": function(event) {
				$scope.page.num--;
				if (page.prev.available())
					page.prev.focus();
				else
					page.focusContainer();
			},
			"available": function() {
				if ($scope.page.num === 0)
					return false;
				
				return true;
			}
		}
	};
	$scope.page = page;
	
	var agendaItem = {
		"onKeypress": function(event, item, $first) {
			var charCode = (typeof event.which === "number") ? event.which : event.keyCode;
			if (charCode === 13 || charCode === 32) {
				if (charCode === 32)
					event.preventDefault();
				event.stopPropagation();
				agendaItem.show(item, $first);
			}
		},
		"show": function(item, $first) {
			// Prompt to start the meeting if clicking in the first item.
			if ($first && meeting.displayStartPopup && page.num === 0 && meeting.pending())
				meeting.showStartPopup();
			
			// Show the agenda item.
			runtimeState.setViewAgendaItem(item.sys_id.value);
		},
		"canReadTask": function(item) {
			return item.task && item.task.record;
		},
		"notifyMe": {
			"onClick": function(event, item) {
				event.preventDefault();
				event.stopPropagation();
				agendaNotification.updateRecipients(item, $scope.data.userId, "add");
			},
			"availableFor": function(item) {
				return !meeting.host() && agendaNotification.notifyAvailable(item) &&
					!agendaNotification.alreadyBeingNotified(item, $scope.data.userId);
			}
		},
		"promote": {
			"onClick": function(event, item) {
				event.stopPropagation();
				meetingAgenda.promoteItem(item)
				.then(function() {
					agendaItem.watchItem = item;
					var unwatch = $scope.$watch("agendaItem.watchItem.order.value", function(newVal, oldVal) {
						// May get string compared to int so '==' required
						if (newVal == oldVal) 
							return;
						
						unwatch();
						agendaItem.watchItem = null;
						page.refreshItems();
						page.focusContainer();
					});
				});
			},
			"availableFor": function(item) {
				return item.state.value === CAB.PENDING && meeting.host();
			}
		},
		"restore": {
			"onClick": function(event, item) {
				event.stopPropagation();
				meetingAgenda.moveItemToPending(item)
				.then(function() {
					agendaItem.watchItem = item;
					var unwatch = $scope.$watch("agendaItem.watchItem.order.value", function(newVal, oldVal) {
						// May get string compared to int so '==' required
						if (newVal == oldVal) 
							return;
						
						unwatch();
						agendaItem.watchItem = null;
						page.refreshItems();
						page.focusContainer();
					});
				});
			},
			"availableFor": function(item) {
				return item.state.value == CAB.NO_DECISION && meeting.host() && meeting.state.current_agenda_item.value;
			}
		}
	};
	$scope.agendaItem = agendaItem;

	var aria = {
		"stateDesc": function(item) {
			if (!agendaItem.canReadTask(item))
				return c.data.i18n.item.state.permissionDenied;
			
			if (item.state.value == CAB.COMPLETE)
				return i18n.format(c.data.i18n.item.state[item.decision.value], [item.task.display_value]);

			return i18n.format(c.data.i18n.item.state[item.state.value], [item.task.display_value]);
		},
		"timerDesc": function(item) {
			if (item.task && item.task.display_value)
				return i18n.format(c.data.i18n.item.timer, [item.task.display_value]);
			
			return null;
		},
		"selectItemDesc": function(item) {
			return i18n.format(c.data.i18n.item.select, [item.task.display_value]);
		},
		"notifyDesc": function(item) {
			return i18n.format(c.data.i18n.item.notify, [item.task.display_value]);
		},
		"promoteDesc": function(item) {
			return i18n.format(c.data.i18n.item.promote, [item.task.display_value]);
		},
		"restoreDesc": function(item) {
			return i18n.format(c.data.i18n.item.restore, [item.task.display_value]);
		}
	};
	$scope.aria = aria;
	
	// Init block
	loadWait.register("agenda");
	runtimeState.get($scope.data.meetingId)
	.then(function(state) {
		meeting.state = state;
		meeting.record = state.cab_meeting.record;
		meeting.displayStartPopup = meeting.host() && meeting.pending();
		
		return meetingAgenda.get($scope.data.meetingId);
	})
	.then(function(agenda) {
		meeting.agenda = agenda;
		meeting.agendaRWMod = meetingAgenda.getRWMod();
		page.loading = false;
		loadWait.unregister("agenda");
		
		// Reset page number and action elemwnt when the filter chnges
		$scope.$watch("selectedItem", function() {
			page.num = 0;
			page.handleNextClicked = false;
		});
		
		// Check if the page number needs to be reset when the current agenda item changes
		$scope.$watch("meeting.state.current_agenda_item.value", function() {
			var requiredItems = (page.num + 1) * CAB.AGENDA.PAGE_SIZE;
			var filter = $scope.selectedItem;
			var userId = $scope.data.userId;
			
			//Update the page number if they're viewing a page and next agenda item gets rid of the page.
			if (!meetingAgenda.hasMoreToRequest(filter, userId) &&
				requiredItems > (meetingAgenda.countLoadedItems(filter, userId) + CAB.AGENDA.PAGE_SIZE - 1) &&
				page.num > 0)
				{
					page.num--;
					page.handleNextClicked = false;
				}
		});
		
		// Control request of not yet loaded agenda items and list refresh.
		$scope.$watchGroup(
			[
				"selectedItem", "page.num",
				"data.userId", "meeting.agenda.length",
				"meeting.state.current_agenda_item.value",
				"meeting.agendaRWMod.cab_agenda_item"
			],
			function(newValues, oldValues) {			
				var filter = $scope.selectedItem;
				var userId = $scope.data.userId;

				var requiredItems = (page.num + 1) * CAB.AGENDA.PAGE_SIZE;
			
				// Decide if we need to request more 
				if (meetingAgenda.hasEarlier(filter, userId, requiredItems) ||
					(requiredItems > meetingAgenda.countLoadedItems(filter, userId) && 
					meetingAgenda.hasMoreToRequest(filter, userId)))
				{
					page.loading = true;
					meetingAgenda.requestMore(filter, userId)
					.then(
						function() {
							page.loading = false;
							if (page.handleNextClicked) {
								page.handleNextClicked = false;
								
								if (page.next.available())
									page.next.focus();
								else
									page.focusContainer();
							}
						},
						function() {
							page.loading = false;
							page.handleNextClicked = false;
						}
					);
				}
				
				page.refreshItems();
			}
		);
	});
}
