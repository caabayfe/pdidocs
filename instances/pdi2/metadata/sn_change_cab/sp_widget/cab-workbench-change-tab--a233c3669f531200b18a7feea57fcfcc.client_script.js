function($scope, runtimeState, meetingAgenda, CAB, i18n) {
	// widget controller
	var c = this;
	var KEY = {
		LEFT_ARROW: 37,
		RIGHT_ARROW: 39,
	};
		
	$scope.hideFormButton = function() {
		var hideFormViewButton = $scope.change && $scope.change.sys_class_name.value != "change_request";
		return hideFormViewButton;
	};
	
	$scope.hideCalendar = function() {
		var hideCalendarViewButton = ($scope.change && $scope.change.sys_class_name.value != "change_request") || ($scope.change && (($scope.change.start_date && $scope.change.start_date.value === "") || ($scope.change.end_date && $scope.change.end_date.value === "")));
		if (hideCalendarViewButton && $scope.tab.selectedTabId === CAB.CAL_TAB)
			$scope.tab.select(CAB.FORM_TAB); 
		return hideCalendarViewButton;
	};

	function clearTaskAndReset() {
		$scope.change = null;
		$scope.tab.select(CAB.FORM_TAB);
	}
	
	function refreshAgendaItem(agendaItemId) {
		if (!agendaItemId) {
			$scope.agendaItem = null;
			clearTaskAndReset();
			return;
		}
		
		meetingAgenda.getAgendaItem(agendaItemId)
		.then(function(agendaItem) {
			$scope.agendaItem = agendaItem;
			if (!agendaItem.task.record) {
				clearTaskAndReset();
				return;
			}
			
			$scope.change = agendaItem.task.record;
		}, clearTaskAndReset);
	}

	runtimeState.get($scope.data.meetingId)
	.then(function(rs) {
		$scope.rs = rs;
		return meetingAgenda.get($scope.data.meetingId);
	})
	.then(function(agenda) {
		$scope.agenda = agenda;

		$scope.$watch(function() {
			return runtimeState.getViewAgendaItem();
		}, refreshAgendaItem);
	});

	$scope.CAB = CAB;
	$scope.aria = {
		panelDesc: function() {
			if (!$scope.change)
				return;

			return i18n.format($scope.data.i18n.tabPanel, $scope.change.number.display_value);
		},
	};

	$scope.meeting = {
		viewingChange: function() {
			return runtimeState.getViewAgendaItem() ? true : false;
		}
	};

	$scope.aItm = {
		canReadTask: function() {
			return $scope.agendaItem && $scope.agendaItem.task && $scope.agendaItem.task.record;
		},
	};

	$scope.tab = {
		selected: function(tabId) {
			return tabId === $scope.tab.selectedTabId;
		},
		select: function(tabId) {
			$scope.tab.selectedTabId = tabId;
		},
		onClick: function($event, tabId) {
			$scope.tab.select(tabId);
		},
		onKeydown: function($event, tabId) {
			if ($event.which === KEY.LEFT_ARROW || $event.which === KEY.RIGHT_ARROW)
				if (!$scope.tab.selected(CAB.CAL_TAB)) {
					$scope.tab.select(CAB.CAL_TAB);
					document.getElementById(CAB.CAL_TAB).focus();
				}
				else {
					$scope.tab.select(CAB.FORM_TAB);
					document.getElementById(CAB.FORM_TAB).focus();
				}
		},
		selectedTabId: CAB.FORM_TAB
	};
}
