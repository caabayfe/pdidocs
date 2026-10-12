function($scope, $timeout, spAriaUtil) {
	/* widget controller */
	var c = this;

	function getActionObject(actionId) {
		var action;
		for (var i = 0; i < $scope.data.action_buttons.length; i++) {
			if (actionId === $scope.data.action_buttons[i].id) {
				action = $scope.data.action_buttons[i];
				break;
			}
		}
		return action;
	}

	c.executeAction = function(actionId, formData) {
		if (!actionId) {
			return;
		}

		$scope.server.get({
			'server_action': 'execute_action',
			'actionId': actionId,
			'formData': formData || {},
			'tableName': $scope.data.resolvedTableName,
			'recordId': $scope.data.resolvedRecordId
		}).then(function(response) {
			//TODO: Allow configuration of a client script on the action to make use of the script output
			if (response && response.liveMessage) {
				spAriaUtil.sendLiveMessage(response.liveMessage);
			}
			c.server.get({
				'tableName': $scope.data.resolvedTableName,
				'recordId': $scope.data.resolvedRecordId
			}).then(function(response){
				$scope.data.action_buttons = response.data.action_buttons;
			});
		});
	}

	c.triggerAction = function(actionId) {
		var action = getActionObject(actionId);
		if (!action) {
			return;
		}
		var hasUserInput = action.userInputs;
		if (hasUserInput) {
			$scope.server.get({
				'server_action': 'trigger_action',
				'actionId': actionId,
				'tableName': $scope.data.resolvedTableName,
				'recordId': $scope.data.resolvedRecordId
			}).then(function(response) {
				var actionModalCtrl;
				var unregister = $scope.$on('$sp.standard_ticket.action.cancel', function() {
					$timeout(function() {
						if (actionModalCtrl) {
							actionModalCtrl.close();
						}
					});
				});

				var closeModalOnSubmit = $scope.$on('$sp.standard_ticket.action.submitted', function(event, data) {
					data = data || {};
					c.executeAction(data.id, data.data);
					actionModalCtrl.close();
				});

				var actionModal = angular.copy(response.data.actionModal);
				actionModal.options.afterOpen = function(ctrl) {
					actionModalCtrl = ctrl;
				};

				actionModal.options.afterClose = function() {
					unregister();
					closeModalOnSubmit();
					c.actionModal = null;
					actionModalCtrl = null;
					if ($('#submit-btn')) {
						$('#submit-btn').focus();
					}
				};
				c.actionModal = actionModal;
			});
		} else {
			c.executeAction(actionId, {});
		}
	};
}
