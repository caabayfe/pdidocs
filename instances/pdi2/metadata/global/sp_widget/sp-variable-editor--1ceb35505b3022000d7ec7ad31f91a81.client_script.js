function($scope, $document, $rootScope, i18n, spScUtil, spNavStateManager) {
  /* widget controller */
  var c = this;
	c.isSaved = false;
	var parent_g_form = $scope.page.g_form;
	var origActionName;

	if (!parent_g_form)
		c.showSave = true;

	c.getItemId = function () {
		return $scope.data.sc_cat_item ? $scope.data.sc_cat_item.sys_id : -1;
	};

	var g_form;
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance){
		if (gFormInstance.getSysId() != -1 && gFormInstance.getSysId() != c.getItemId())
			return;

		if (parent_g_form)
			addSaveHandler();

		g_form = gFormInstance;
		spNavStateManager.register($scope.data.table + ".variables", c.save, g_form);
		g_form.$private.events.on('submitted', function() {
				if (!c.showSave) {
					c.server.update().then(function() {
						parent_g_form.submit(origActionName);
						c.isSaved = true;
					});
				}
				else {
				c.server.update().then(function() {
				g_form.addInfoMessage(i18n.getMessage('Variable saved'));
				g_form.$private.userState.clearModifiedFields();
				if (c.options.isServiceWorkspace == true) { //Workspace handler
					if (window.parent === window) {
						console.warn("Parent is missing. Is this called inside an iFrame?");
						return;
					}
					window.parent.postMessage({
							messageType: 'IFRAME_MODAL_MESSAGE_TYPE',
							modalAction: 'IFRAME_MODAL_ACTION_CONFIRMED',
							modalId: 'sn-modal-iframe-singleton'
					}, location.origin)
				}
				if (c.data.table == "sc_cart_item")
					$rootScope.$broadcast("$sp.service_catalog.cart.update");
				});
			}
		})
	});

	// Used when embedded as a formatter
	function addSaveHandler() {
		parent_g_form.$private.events.on("submit", function() {
			var actionName = parent_g_form.getActionName();
			// If actionName is none, form has already been re-submitted.
			// No need to submit it the third time.
			if (actionName === 'none') { return false; }

			origActionName = actionName;
			if (c.isSaved) return true;

			if (!spScUtil.isServerValidationDone($scope.data.sc_cat_item._fields)) {
				$scope.validating = true;
				return false;
			}

			if (g_form)
				return g_form.submit();
			return true;
		});
		parent_g_form.$private.events.on("submitted", function() {
			c.isSaved = false;
		});
	}

	c.save = function() {
		var activeElement = $document.activeElement;
		if (activeElement)
			activeElement.blur();
		if (!spScUtil.isServerValidationDone($scope.data.sc_cat_item._fields))
			$scope.validating = true;

		else if (g_form)
			g_form.submit();
	};
	c.hasVariables = function(fields) {
		if (!fields)
			return false;

		return Object.keys(fields).length > 0;
	}

	var validationComplete = $rootScope.$on('$sp.service_catalog.form_validation_complete', function() { $scope.validating = false; });
}
