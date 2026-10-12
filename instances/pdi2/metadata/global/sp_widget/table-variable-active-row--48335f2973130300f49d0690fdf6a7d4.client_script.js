function($rootScope, $scope, spAtf, $q, $timeout, cabrillo, i18n, spScUtil) {
  /* widget controller */
  var c = this;
	c.isNative = cabrillo.isNative() && c.data.isMEE;
	c.data.close_modal_label = c.data.msgs.closeModalMsg;

	if(c.isNative) {
		cabrillo.viewLayout.setNavigationBarButtons();
		cabrillo.viewLayout.hideBackButton();
	}

	if (c.data.action == c.data.actions.ADD_ROW) {
		c.data.modal_title = c.data.msgs.addRowTitleMsg;
		c.data.primary_action_label = c.data.msgs.addRowButtonlabel;
	} else {
		c.data.modal_title = c.data.msgs.editRowTitleMsg;
		c.data.primary_action_label = c.data.msgs.editRowButtonLabel;
	}

	$scope.disableControls = function() {
		return !!$scope.validating;
	}

	function displayNativeButtons() {
		if (c.isNative) {
			cabrillo.viewLayout.setBottomButtons();
			cabrillo.viewLayout.setTitle(c.data.modal_title);
			var buttons = [
				{
					title: c.data.msgs.closeRowButtonLabel,
					enabled: true,
					backgroundColor: '#f7f7f7',
					textColor: '#000000'
				},
				{
					title: c.data.primary_action_label,
					enabled: true,
					backgroundColor: $scope.data.sys_properties.isPolaris == "true" ? null : $scope.data.sys_properties.mobileNativeColor,
					textColor: $scope.data.sys_properties.isPolaris == "true" ? null : '#FFFFFF'
				}
			];

			// Timeout is to give a better user experience otherwise when popup opens, the cabrillo buttons
			// will be displayed immediately giving a bad user experience.
			$timeout(function() {
				cabrillo.viewLayout.hideBackButton();
				cabrillo.viewLayout.setBottomButtons(buttons, function(buttonIndex) {
					switch (buttonIndex) {
						case 0:
							c.dismiss();
							break;
						case 1:
							c.saveRow();
							break;
					}
				})
			}, 100);
		}
	}

	$scope.$on("$$uiNotification", function(evt, $$uiNotification) {
		//This will dismiss all the UI message in the Parent window.
		//Widget widget-modal does not listen to $$uiNotification.dismiss so the message remains only in modal but not in parent window.
		//This could go in widget-modal but we want to avoid any regression of dismissing some important message in parent.
		$timeout(function() {
			$scope.$emit("$$uiNotification.dismiss");
		}, 501);
	});

	var g_form, mespClosePopupUnregister;
	$scope.$on('spModel.gForm.initialized', function (event, gFormInstance) {
		if (gFormInstance.getSysId() != c.data.active_row.sys_id)
			return;

		mespClosePopupUnregister = $rootScope.$on("mesp.popup.close", function() {
			$timeout(function(){
				displayNativeButtons();
			}, 100);
		});
		displayNativeButtons();
		g_form = gFormInstance;
		backupValidationScriptState();
		// This runs after all onSubmit scripts have executed
		g_form.$private.events.on('submitted', function(){
			broadCastAction(c.data.action);
		});
	});

	$scope.$on("$destroy", function() {
		mespClosePopupUnregister();
	});

	$scope.$on("modal.closing", function(event, reason) {
		if (reason == 'escape key press') {
			event.preventDefault();
			c.dismiss();
		}
	});

	var tableVarUtil = {
		updateGform: function() {
			$scope._atf.expose('g_form', spAtf.augmentForm(g_form));
		},

		saveRow: function(timeout) {
			var defer = $q.defer();
			c.saveRow(timeout);
			var cleanupReject = $scope.$on('$sp.service_catalog.form_submit_failed', function() {
					cleanupReject();
					defer.reject("Can't save row.");
			});
			if (g_form) {
				var cleanUpResolve = $scope.$on('$sp.sc_multi_row_active_row.add', function(o, result) {
					$timeout(function() {
						cleanUpResolve();
						defer.resolve(result);
					});
				});
			}
			else
				defer.reject('g_form not initialized.');
			return defer.promise;
		}
	}

	spAtf.init().then(function(atf) {
		$scope._atf = atf;
		atf.expose('table_var_util', tableVarUtil);
	});

	function broadCastAction(action) {
		if (c.isNative) {
			cabrillo.viewLayout.setBottomButtons();
			cabrillo.viewLayout.showBackButton();
			$timeout(function() {
				$rootScope.$emit('spModel.gForm.showNativeMobileButtons');
			}, 100);
		}
		switch(action) {
			case c.data.actions.ADD_ROW:
				$rootScope.$broadcast('$sp.sc_multi_row_active_row.add', serialize(c.data.active_row._fields));
				break;
			case c.data.actions.EDIT_ROW:
				$rootScope.$broadcast('$sp.sc_multi_row_active_row.update', serialize(c.data.active_row._fields));
				break;
			default:
				$rootScope.$broadcast('$sp.sc_multi_row_active_row.cancel', getSource());
				break;
		}
		NOW.validationScriptState = NOW.backupValidationScriptState;
	}

	function backupValidationScriptState() {
		if (NOW.validationScriptState !== undefined) {
			NOW.backupValidationScriptState = NOW.validationScriptState;
			NOW.validationScriptState = undefined;
		}
	}

   c.saveRow = function (timeout) {
		$scope.$evalAsync(function () {
			var duplicateUniqueFields = getDuplicateUniqueFields();
		 	if (duplicateUniqueFields.length > 0) {
		 		var alertText = i18n.format(c.data.msgs.duplicateUniqueFieldErrMsg, duplicateUniqueFields.join(', '));
				if (g_form)
					g_form.addErrorMessage(alertText);
				else
					console.log(alertText);
                return false;
            }
			if (!spScUtil.isServerValidationDone($scope.data.active_row._fields)) {
				$scope.validating = true;
				$scope.triggerPostValidation = c.saveRow;
			} else if (g_form) {
					if (!g_form.submit()) {
						timeout = timeout || 1000;
						$timeout(function () {
							$scope.$broadcast('$sp.service_catalog.form_submit_failed', {action_name: 'submit'});

							var activeRowElement = document.getElementById("mrvs_active_row");
							if (activeRowElement && !activeRowElement.contains(document.activeElement))
								if (document.getElementById("mrvs_save_button"))
									document.getElementById("mrvs_save_button").focus();

						}, timeout);
					}
			}
			else {
				console.log("G_Form is not defined");
				broadCastAction();
				return false;
			}
		});
   };

	function getDuplicateUniqueFields() {
        var uniqueColumnNames = {};
        var uniqueColumnLabels = {};
        var activeRow = c.data.active_row;
        var duplicateUniqueFields = [];

        if (g_form && activeRow) {
            var activeRowParent = activeRow.parent;
            var activeRowName = activeRow.name;
            var activeRowFields = activeRow._fields;

            // populate Unique Column Names from form fields
            if (activeRowFields) {
                for (var field in activeRowFields) {
                    if (activeRowFields[field]['unique']) {
                        uniqueColumnNames[field] = activeRowFields[field]['label'];
                        uniqueColumnLabels[activeRowFields[field]['label']] = field;
                    }
                }
            }

            if ($scope.data.invalid_unique_columns) {
            	for (var i = 0; i < $scope.data.invalid_unique_columns.length; i++)
		    g_form.$private.setFieldInvalid($scope.data.invalid_unique_columns[i], false);
            }

            if (Object.keys(uniqueColumnNames).length > 0 && activeRowParent &&
                activeRowParent[activeRowName] && activeRowParent[activeRowName].value) {

                var currentRowData = {};
                var parentGridData = activeRowParent[activeRowName].value;
                if (!Array.isArray(parentGridData))
                    parentGridData = JSON.parse(parentGridData);
                var existingRowData = c.data.rowData;
                // populate current row data as field_name:value pair
                for (var uniqueColName in uniqueColumnNames) {
                    currentRowData[uniqueColName] = g_form.getValue(uniqueColName);
                }
                duplicateUniqueFields = getDuplicateFields(uniqueColumnNames, parentGridData, existingRowData, currentRowData);
                $scope.data.invalid_unique_columns = [];

                for (var i = 0; i < duplicateUniqueFields.length; i++) {
                    g_form.$private.setFieldInvalid(uniqueColumnLabels[duplicateUniqueFields[i]], true);
                    $scope.data.invalid_unique_columns.push(uniqueColumnLabels[duplicateUniqueFields[i]]);
                }
            }
        }
        return duplicateUniqueFields;
    }

	c.dismiss = function () {
		broadCastAction();
	};

	var validationComplete = $rootScope.$on('$sp.service_catalog.form_validation_complete', function() {
		 if ($scope.validating) {
			 $scope.validating = false;
			 if (typeof $scope.triggerPostValidation === 'function') $scope.triggerPostValidation();
		 }
		$scope.triggerPostValidation = null;
	});

	function _getChoiceLabel(choices, value) {
		for (var i=0; i< choices.length; i++) {
			var choice = choices[i];
			if (choice.value == value)
				return choice.label;
		}
		return "";
	}

	function serialize(fields) {
		var fieldData = {};
		fieldData.cat_item = c.data.cat_item;
		fieldData.variable_set_id = c.data.variable_set_id;
		fieldData.value = {};
		fieldData.display_value = {};
		for (var f in fields) {
			var field = fields[f];
			var value = field.value;
			if (field.value != field.stagedValue) {
				if (g_prevent_access_from_console == false || (!g_form.isReadOnly(field.name) && g_form.isVisible(field.name)))
					value = field.stagedValue;
			}
			if (field.type && field.type == 'masked')
				field.displayValue = '**********';

			if (field.type && field.type == 'glide_duration' && field.value != '') {
				field.displayValue = parseDisplayValueForDuration(field.value);
			} else if (field.type == "choice" || field.type == "multiple_choice") {
				field.displayValue = _getChoiceLabel(field.choices, value);
			}

			fieldData.value[field.name] = value + '';
			fieldData.display_value[field.name] = field.displayValue + '';
		}
		return fieldData;
	}

	function getSource() {
		var source = {};
		source.cat_item = c.data.cat_item;
		source.variable_set_id = c.data.variable_set_id;
		return source;
	}

	function parseDurationToParts(value) {
		var MS_IN_DAY = 86400000;
		var parts = value.split(" ");
		if (parts.length == 2) {
			var times = parts[1].split(":");
			for (var i = 0; i < times.length; i++)
				parts[1 + i] = times[i];
			var dateParts = parts[0].split("-");
			if (dateParts.length == 3)
				// coming from existing record: "1970-01-05
				// 00:05:00"
				parts[0] = parseInt(Date.parse(dateParts[1]
						+ '/' + dateParts[2] + '/'
						+ dateParts[0] + ' 00:00:00 UTC'))
						/ MS_IN_DAY;
		}

		return parts;
	}

	function parseDisplayValueForDuration(value) {
		value = parseDurationToParts(value);
		var d = parseInt(value[0], 10);
		var h = parseInt(value[1], 10);
		var m = parseInt(value[2], 10);
		var s = parseInt(value[3], 10);
		var daysString = d > 0 ? d + ' ' : '';
		var timeString = [h, m, s].map(prependZero).join(':');
		return daysString + timeString;
	}

	function prependZero(number) {
		return (number < 10 ? '0' : '') + number;
	}
}
