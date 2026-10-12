function($scope, spUtil, $window, $timeout, i18n, $http) {
  /* widget controller */
  var c = this;
	c.completedMessage = { head: '', body: '', visibility: { show: false, autoHide: true } };
	spUtil.recordWatch($scope, c.data.tableName, c.data.filter, function(name) {
		$scope.server.update();
	});
	
	/* Record Watchers */
	c.lastInstanceNotified = null;
	if (c.data.activitySetCtxID) {
		var stageMessagePromise;
		var unregisterJourneyListener = $rootScope.$on('journey.complete', function() {
			if (stageMessagePromise)
				$timeout.cancel(stageMessagePromise);
			c.completedMessage.head = c.data.completedJourneyHead;
			c.completedMessage.body = c.data.completedJourneyBody;
			c.completedMessage.visibility.show = true;
		});
		spUtil.recordWatch($scope, 'sn_hr_le_activity_set_context', 'sys_id='+c.data.activitySetCtxID, function(response) {
			if (!response.data || !response.data.changes || response.data.changes.indexOf('state') < 0)
				return;
			if (!response.data.record || !response.data.record.state || !response.data.record.state.value)
				return;
			if (response.data.record.state.value === 'finished') {
				stageMessagePromise = $timeout(function() {
					unregisterJourneyListener();
					$http.get('/api/now/table/sn_hr_le_activity_set_context/' + response.data.sys_id + '?sysparm_fields=activity_set.display_title')
						.then(function(displayTitleResponse) {
							var displayTitle = displayTitleResponse.data.result['activity_set.display_title'];
							c.completedMessage.head = i18n.format(c.data.completedSetHead, displayTitle);
							c.completedMessage.body = c.data.completedSetBody;
							c.completedMessage.visibility.show = true;
						});
				}, 1000);
			}
		});
	}
	
	spUtil.recordWatch($scope, c.data.tableName, "sys_id="+c.data.sysIdURL, function(updateInfo) {
		c.server.get({
			action: "addNotification",
			taskId: c.data.sysIdURL,
			table: c.data.tableName
		}).then(function(response){
			response.action = undefined;
			if(response.data.taskInfo && response.data.taskInfo.taskId && c.lastInstanceNotified !== response.data.taskInfo.taskId){
				c.lastInstanceNotified = response.data.taskInfo.taskId;
				var taskInfo = {
					taskId: response.data.taskInfo.taskId,
					taskDescription: response.data.taskInfo.taskDescription
				}
				$rootScope.$broadcast("sn_lp.task_completed", taskInfo);
			}
		});
	});
}
