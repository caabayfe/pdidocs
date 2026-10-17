function($scope, $timeout) {
  var c = this;

  c.enableSubmit = false;

	$scope.handleCancel = function() {
		$rootScope.$broadcast('$sp.standard_ticket.action.cancel');
	};

	$scope.handleSubmit = function() {
		if (g_form) {
			g_form.submit();
		} else {
			$rootScope.$broadcast('$sp.standard_ticket.action.submitted', {});
		}

	};

	var g_form;
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
		//TODO: Eventually create a instance for every action execution
		if (gFormInstance.getSysId() !== -1 && gFormInstance.getSysId() !== $scope.data.action_button.id) {
			return;
		}
		c.enableSubmit = true;
		g_form = gFormInstance;

		g_form.$private.events.on('submitted', function() {

			var payload = {};
			payload.id = $scope.data.action_button.id;
			payload.data = getData(g_form);
			$rootScope.$broadcast('$sp.standard_ticket.action.submitted', payload);
		});
	});

	function getData(gForm) {
		var data = {};
		var fieldNames = gForm.getFieldNames();
		for (var i = 0; i < fieldNames.length; i++) {
			var fieldName = fieldNames[i];
			data[fieldName] = gForm.getValue(fieldName);
		}
		return data;
	}
}
