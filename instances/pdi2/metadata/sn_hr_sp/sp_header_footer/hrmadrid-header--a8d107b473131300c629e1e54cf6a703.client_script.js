function ($rootScope, $scope, snRecordWatcher, spUtil, $location, $uibModal, cabrillo, $timeout) {
	var c = this;
	$scope.userID = $scope.user.sys_id;
	$scope.todosPopupId = c.data.isMobile?'#popup_todos_mobile':'';
	$scope.casesPopupId = c.data.isMobile?'#popup_cases_mobile':'';
	$scope.popupType = c.data.isMobile?'collapse':'dropdown';

	if (cabrillo.isNative())
		$scope.isViewNative = true;
	
	$scope.$on("$locationChangeSuccess", function(event, data){
		if(c.data.isMobile){
			if($('div#popup_todos_mobile').is(":visible"))
				$('li > a#todos_popup').click();
			else if($('div#popup_cases_mobile').is(":visible"))
			$('li > a#cases_popup').click();
		} else {
			$('li.open > a#cases_popup').click();
			$('li.open > a#todos_popup').click();	
		}
	})

	$scope.$on('sp_loading_indicator', function(e, value) {
		$scope.loadingIndicator = value;
	});
	
	/* Record Watchers */ 
	spUtil.recordWatch($scope, "sn_hr_core_task", "assigned_to=" + $scope.userID, function(watcherUpdate) {
		if ($scope.isRelevantRecordUpdate(watcherUpdate.data, 'sn_hr_core_task'))
			$scope.reloadHeader($scope.data.ACTION_TODO_COUNT);
	});
	
	spUtil.recordWatch($scope, "sn_hr_core_case", "opened_for=" + $scope.userID, function(watcherUpdate) {
		if ($scope.isRelevantRecordUpdate(watcherUpdate.data, 'sn_hr_core_case'))
			$scope.reloadHeader($scope.data.ACTION_TODO_COUNT);
	});
	
	spUtil.recordWatch($scope, "sysapproval_approver", "approver=" + $scope.userID, function(watcherUpdate) {
		if ($scope.isRelevantRecordUpdate(watcherUpdate.data, 'sysapproval_approver'))
			$scope.reloadHeader($scope.data.ACTION_TODO_COUNT);
	});
	
	$scope.reloadHeader = function(actionName) {
		c.data.action = actionName || c.data.ACTION_LOAD_CASES;
		c.server.update();
	};
	
	$scope.openPopUp = function() {
		var url = "$chat_support.do?queueID=" + $scope.data.connect_support_queue_id;
		var popup = window.open (url, "popup", "width=900, height=600"); 
	};

	$scope.openLogin = function () {
		$scope.modalInstance = $uibModal.open({
			templateUrl: 'modalLogin',
			scope: $scope
		});
	};
	
	$rootScope.$on("update.searchpage", function(e, searchPage){
		$scope.searchPage = searchPage;
  });
	
	$rootScope.$on('sp.avatar_changed', function() {
		$scope.userID = "";
		$timeout(function(){
			$scope.userID = $scope.user.sys_id;
		});
	});

	$scope.isHomepage = function() {
		if (!$scope.page.id)
			return true;

		if ($scope.page.id == $scope.portal.homepage_dv)
			return true;

		return false;
	};
	
	$scope.isRelevantRecordUpdate = function(watcherData, tableName) {
		var operation = watcherData.operation;
		if (operation == 'delete')
			return true;
		
		if (watcherData.record) {
			var active = watcherData.record.state.value;
			var activeChanged = watcherData.changes.indexOf('active') >= 0;
			var state = watcherData.record.state.value;
			var stateChanged = watcherData.changes.indexOf('state') >= 0;
			var userChanges = false;
			
			//Check if user changes
			if (tableName == 'sysapproval_approver')
				userChanges = watcherData.changes.indexOf('approver') >= 0;
			else if (tableName == 'sn_hr_core_task')
				userChanges = watcherData.changes.indexOf('assigned_to') >= 0;
			else if (tableName == 'sn_hr_core_case')
				userChanges = watcherData.changes.indexOf('opened_for') >= 0;

			//Check insertion
			if (operation == 'insert') {
				if (tableName == 'sysapproval_approver')
					return state == 'requested';
				else if (tableName == 'sn_hr_core_task')
					return active && (state == '10' || state == '18');
				else if (tableName == 'sn_hr_core_case')
					return active && state == '20';
			}
			else if (operation == 'update') {
				if (tableName == 'sysapproval_approver')
					return stateChanged || userChanges;
				else if (tableName == 'sn_hr_core_task' || tableName == 'sn_hr_core_case')
					return activeChanged || stateChanged || userChanges;
			}
		}
		
		return false;
	};
	
	$(document).ready(function() {
		$scope.reloadHeader();				
	});	
}
