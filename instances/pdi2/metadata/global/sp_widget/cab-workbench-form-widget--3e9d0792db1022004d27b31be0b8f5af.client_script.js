function($scope, $timeout, $window, CAB, runtimeState, meetingAgenda, modelUtil, go) {
	var ctrl = this;
	var KEY = {  //Move to CAB constants.
		LEFT_ARROW: 37,
		RIGHT_ARROW: 39,
	};
	var g_form;
	var delayRefresh;
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
		g_form = gFormInstance;
	});
	function runtimeStateAvailable() {
		return $scope.rs && $scope.rs.cab_meeting;
	}
	var meeting = {
		start: function() {
			runtimeState.startMeetingAndSelectNextAgenda();
		},
		end: function() {
			runtimeState.endMeeting();
		},
		pending: function() {
			if (!runtimeStateAvailable())
				return false;
			return $scope.rs.cab_meeting.record.state.value == CAB.PENDING;
		},
		inProgress: function() {
			if (!runtimeStateAvailable())
				return false;
			return $scope.rs.cab_meeting.record.state.value == CAB.IN_PROGRESS;
		},
		canceled: function() {
			if (!runtimeStateAvailable())
				return false;
			return $scope.rs.cab_meeting.record.state.value == CAB.CANCELED;
		},
		complete: function() {
			if (!runtimeStateAvailable())
				return false;
			return $scope.rs.cab_meeting.record.state.value == CAB.COMPLETE;
		},
		host: function() {
			if (!runtimeStateAvailable())
				return false;
			return runtimeState.isCABManager($scope.data.userId);
		},
		agendaComplete: function() {
			return !meetingAgenda.hasMorePending();
		},
		loading: true,
	};
	var agendaItemCtrl = {
		canReadTask: function() {
			return $scope.agendaItem && $scope.agendaItem.task && $scope.agendaItem.task.record;
		}
	};
	
	function fudgeFieldValue(fieldValue) {
		return fieldValue[fieldValue.length-1] === "\n" ? fieldValue.slice(0,-1) : fieldValue + "\n";
	}
	
	function getCabCtrl() {
		return {
			onEdit: function() {
				go.toTaskFormModal($scope.agendaItem);
			},
			tab: {
				onSelect: function(tabId) {
					if (tabId && this.defn[tabId])
						this.showTab(tabId);
					if (!g_form)
						return;
					// Reset any string values in the tab to force resize of field
					// Set timeout so that when agenda item is changed, this function can pickup correct values from g_form
					$timeout(function(){
						if (!this.defn[tabId]) {
							return;
						}
						var tabSections = this.defn[tabId].sections;
						tabSections.forEach(function(tabSection) {
							tabSection.columns.forEach(function(column) {
								column.fields.forEach(function(field) {
									if (field.type !== "field")
										return;
								
									var fieldDef = $scope.data.f._fields[field.name];
									if (fieldDef && (fieldDef.type === "string" || fieldDef.type === "template_value")) {
										var formValue = fudgeFieldValue(g_form.getValue(field.name));
										var formDisplayValue = fudgeFieldValue(g_form.getDisplayValue(field.name));
										g_form.setUserValue(field.name, formValue, formDisplayValue);
									}
								});
							});
						});
					}.bind(this),0);
				},
				onKeydown: function($event, tabId) {
					if (!this.defn[tabId])
						return;
					if ($event.which === KEY.LEFT_ARROW || $event.which === KEY.RIGHT_ARROW) {
						var nextLoc = $event.which === KEY.RIGHT_ARROW ? 1 : -1;
						var tabLoc = this.order.indexOf(tabId) + nextLoc;
						if (tabLoc === this.order.length)
							tabLoc = 0;
						else if (tabLoc < 0)
							tabLoc = this.order.length -1;
						var tabElem = document.getElementById(this.order[tabLoc] + "-tab");
						tabElem.focus();
						this.onSelect(this.order[tabLoc]);
					}
				},
				selected: function(tabId) {
					return this._selTab[tabId] || false;
				},
				showTab: function(tabId) {
					Object.keys(this._selTab).forEach(function(key) { this._selTab[key] = false; }, this);
					this._selTab[tabId] = true;
				},
				_selTab: {},
				order: [],
				defn: {},
				
			},
		};
	}
	function buildCABControl() {
		var cabCtrl = getCabCtrl();
		if ($scope.data.f && $scope.data.f._sections) {
			$scope.data.f._sections.forEach(function(section) {
				if (section.id && cabCtrl.tab.order.length === 0) {  //It's the first section
					cabCtrl.tab._selTab[section.id] = true;
					cabCtrl.tab.order.push(section.id);
					cabCtrl.tab.defn[section.id] = {
						label: $scope.data.i18n.tabLabel.change,
						sections:[],
					};
				}
				var sectionId = section.id ? section.id : cabCtrl.tab.order[cabCtrl.tab.order.length-1];
				if (!cabCtrl.tab.defn[sectionId]) {
					cabCtrl.tab.order.push(sectionId);
					cabCtrl.tab.defn[sectionId] = {
						label: section.captionDisplay,
						sections:[],
					};
				}
				cabCtrl.tab.defn[sectionId].sections.push(section);
			});
		}
		return cabCtrl;
	}
	var unwatchChange;
	var taskClassTabObj = {};

	function displayChange(agendaItemSysId) {
		if (unwatchChange)
			unwatchChange();

		if (!agendaItemSysId) {
			$scope.agendaItem = null;
			return;
		}
		
		meetingAgenda.getAgendaItem(agendaItemSysId)
		.then(function(agendaItem) {
			$scope.agendaItem = agendaItem;

			unwatchChange = $scope.$watch("agendaItem.task.record", function() {
				if ($scope.data.sys_id !== $scope.agendaItem.task.value) { //Change request record has changed
					$scope.data.sys_id = agendaItem.task.value;
					var previousForm = $scope.data.f;

					//store _selTab of each different task class
					if (previousForm && previousForm.table && previousForm.cab && previousForm.cab.tab && previousForm.cab.tab._selTab) {

						var previousTaskClass = previousForm.table;

						if (!taskClassTabObj[previousTaskClass])
							taskClassTabObj[previousTaskClass] = previousForm.cab.tab._selTab;
					}

					$scope.data.f = agendaItem.task._form;

					if (!$scope.data.f.cab)
						$scope.data.f.cab = buildCABControl();

					if (taskClassTabObj[$scope.data.f.table])
						$scope.data.f.cab.tab._selTab = taskClassTabObj[$scope.data.f.table];
				}
			}, true);
		},
		function() {
			$scope.agendaItem = null;
		});
	}
	// Build scope
	angular.extend($scope, {
		meeting: meeting,
		agendaItemCtrl: agendaItemCtrl,
		agendaItem: null
	});
	// Initial setup
	runtimeState.get($scope.data.meetingId)
	.then(function(runtimeState) {
		$scope.rs = runtimeState;
		return meetingAgenda.get($scope.data.meetingId);
	}, modelUtil.failNicely)
	.then(function(agendaItems) {
		$scope.meeting.loading = false;
		$scope.$watch(function() {
			return runtimeState.getViewAgendaItem();
	}, displayChange);
	}, modelUtil.failNicely);
}
