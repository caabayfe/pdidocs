function($rootScope, $scope, $timeout, $location, $log, $window, spUtil, nowAttachmentHandler, spAriaUtil, spNavStateManager, $element) {
  $scope.submitting = false;
  $scope.mandatory = [];
  $scope.errorMessages = [];
  $scope.data.show_sql = false;
  $scope.saveButtonSuffix = spUtil.getAccelerator('s');
  $scope.isPageReady = false;
  $scope.embeddedInModal = false;
  $scope.adminMenu = {
    encodedPageUrl: encodeURIComponent($location.url()),
    getClientScriptCount: function() {
      var count = 0;
      if ($scope.data.f.client_script) {
        count += $scope.data.f.client_script.onChange.length;
        count += $scope.data.f.client_script.onLoad.length;
        count += $scope.data.f.client_script.onSubmit.length;
      }
      return count;
    }
  };
	var tableId = $scope.data.sys_id != -1 ? $scope.data.sys_id : ($scope.data.f ? $scope.data.f._attachmentGUID : -1);
  if ($scope.data.table === 'sys_attachment' && tableId && tableId !== -1) {
    // redirect to platform attachment download link
      var queryParams = new URLSearchParams(location.search);
      queryParams['delete']("id");queryParams['delete']("table"); //removing id,table attributes in platform -> portal URL conversion.
      var queryString = (new URLSearchParams(queryParams)).toString();
      var downloadLink = window.location.origin + '/sys_attachment.do?' + queryString;
      window.location.replace(downloadLink);return;
    }
	spUtil.recordWatch($scope, "sys_attachment", "table_sys_id=" + tableId, function (response, data) {
    $scope.attachmentHandler.getAttachmentList();
    if (response.data) {
        var options = {};
        options.operation = response.data.operation;
        options.filename = response.data.display_value;
        options.sys_id = tableId;
        options.table = $scope.data.table;
        options.state = (response.data.record && response.data.record.state) ? response.data.record.state.value : "";
        if (options.operation === 'update' && options.state === 'not_available')
         $rootScope.$broadcast("attachment.updated", options);
    }
});

  spUtil.recordWatch($scope, $scope.data.table, "sys_id=" + $scope.data.sys_id, function (response) {
    try {
      Object.keys(response.data.record).forEach(function(changedField) {
        var formField = $scope.data.f._fields[changedField];
        if (!formField)
          return;

        var newData = response.data.record[changedField];
        var isDisplayValue = formField.type == "glide_date_time" || formField.type == "calendar_date_time" || formField.type == "due_date";
        var newValue = isDisplayValue ? newData.display_value : newData.value;

        if (g_form.getValue(changedField) != newValue) {
          g_form.setValue(changedField, newValue);
        }
      });
    } catch (e) {}
  });

  $rootScope.$on('$sp.html.editor.progress', function(e, conf) {
      $scope.submitting = conf.state;
  });

  var cleanupAbortedListner = $rootScope.$on('sn.attachment.aborted', function() {
      spUtil.retrieveSessionMessages();
  });

  $scope.getButtonClass = function(action) {
		if (action.form_style == "destructive")
			return "btn-danger";

		if (action.form_style == "primary")
			return "btn-primary";

		return "btn-default";
	};

  $scope.getUIActions = function(type) {
    if ($scope.data.disableUIActions)
      return [];
    if (type) {
      return $scope.data.f._ui_actions.filter(function(action) {
        //We handle the primary action button separately.
        return !action.primary && action['is_' + type];
      });
    } else {
      return $scope.data.f._ui_actions;
    }
  }

  $scope.getPrimaryAction = function() {
    var primaryActions = $scope.data.f._ui_actions.filter(function(action) {
      return action.primary;
    });
    return (primaryActions.length) ? primaryActions[0] : null;
  }
	
	  // Helper function to check if form has any mandatory fields
  $scope.hasMandatoryFields = function() {
    if (!$scope.data.f || !$scope.data.f._fields)
      return false;
    for (var field in $scope.data.f._fields) {
      if ($scope.data.f._fields[field].mandatory)
        return true;
    }
    return false;
  }

  $scope.getUIActionContextMenu = function(event) {
    var menu = [];
    if (event.ctrlKey)
      return menu;

    var contextActions = $scope.getUIActions('context');
    contextActions.forEach(function(action) {
      menu.push([action.name, function() {
        $scope.triggerUIAction(action);
      }, null, null, {role: "button"}]);
    });

    if (contextActions.length > 0)
      menu.push(null);
    menu.push([$scope.data.exportPDFMsg, function() {
      exportPDF("");
    }]);
    menu.push([$scope.data.exportPDFLandMsg, function() {
      exportPDF('true');
    }]);

    return menu;
  }

  function exportPDF(landscape) {
    $window.open("/" + $scope.data.f.table + ".do?PDF&landscape=" + landscape + "&sys_id=" + $scope.data.sys_id + "&sysparm_view=" + $scope.data.f.view);
  }

  //trigger the primary UI Action on save (if there is one)
  var deregister = $scope.$on('$sp.save', function() {
    var primaryAction = $scope.getPrimaryAction();
    if (primaryAction)
      $scope.delayTriggerUIAction(primaryAction);
  });
  $scope.$on('$destroy', function() {
    deregister()
  });

  $scope.$on('esLatestValueChanged', function(event, newValue) {
      $scope.data.esLatestVersion = newValue;
  });	

  $scope.triggerUIAction = function(action) {
    if ($scope.data.disableUIActions && !action.primary) {
      return;
    }

    var activeElement = document.activeElement;
    if (activeElement) {
      activeElement.blur();
    }
    $scope.$evalAsync(function() {
      if (g_form) {
        g_form.useEsLatest = function() {
            return $scope.data.esLatestVersion;
        }
        if (!g_form.submit(action.action_name || action.sys_id))
          $scope.submitting = false;
      }
    });
  }
  $scope.delayTriggerUIAction = _.debounce($scope.triggerUIAction, 1000, {
    'leading': true,
    'trailing': false
  });

  $scope.$on("spModel.uiActionComplete", function(evt, response, savedFormSysId) {
    if (!response.isInsert &&  ($scope.data.sys_id !== savedFormSysId))
      return;

    $scope.submitting = false;
    if (response.isActionAborted)
      return;

    var sysID = (response.isInsert) ? response.sys_id : $scope.data.sys_id;
		$scope.data.isInsert = response.isInsert;

    if (response.isInsert && !$scope.data.preventUrlUpdateOnSubmit) {
		var search = $location.search();
		search.sys_id = sysID;
		search.spa = 1;
		$location.search(search).replace();
	}

    loadForm($scope.data.table, sysID).then(constructResponseHandler(response));
  });

  function constructResponseHandler(response) {
    return function() {
	  $rootScope.$broadcast("sp.form.submitted", {sys_id: (response.isInsert) ? response.sys_id : $scope.data.sys_id});
      var message;
      var eventName = "sp.form.record.updated";
      if (response.isInsert) {
        message = $scope.data.recordAddedMsg;
      } else
        message = $scope.data.updatedMsg;

      $scope.data.hideRelatedLists = hideRelatedLists();
      $scope.$emit(eventName, $scope.data.f._fields, $scope.data.sys_id);
      $rootScope.$broadcast(eventName, $scope.data.f._fields, $scope.data.sys_id);
      $scope.status = message;
      spUtil.addTrivialMessage(message);
      spUtil.simulateFakeFormSubmitForAutoComplete('widget-form', $scope.data.f._fields);
      $timeout(clearStatus, 2000);
    }
  }

  var ctrl = this;
  // switch forms
  var unregister = $scope.$on('$sp.list.click', onListClick);
  $scope.$on("$destroy", function() {
    unregister();
    cleanupAbortedListner();
  })

	function _save() {
		var primaryAction = $scope.getPrimaryAction();
    if (primaryAction)
      $scope.triggerUIAction(primaryAction);
	}

	function onListClick(evt, arg) {
		spUtil.clearMessages();
		if ($scope.data.table === 'sys_attachment') {
			if (arg.sys_id && arg.sys_id != -1)
				$location.url('/sys_attachment.do?sys_id=' + arg.sys_id);
		} else
		loadForm(arg.table, arg.sys_id);
	}

  function loadForm(table, sys_id) {
    var f = {};
    $scope.data.table = f.table = table;
    $scope.data.sys_id = f.sys_id = sys_id;
    angular.extend(f,$scope.data.f);
    $scope.data.f.ui_scripts = [];
    $scope.data.f._formatters = {};
    $scope.data.f.policy = [];
    $scope.data.f.validation_scripts = [];

    var prom = $scope.server.update();
    prom.then(setupAttachmentHandler);
    prom['catch'](function (e){
      angular.extend($scope.data.f,f);
    });
    return prom;
  }

  function openRelatedList(e, queryString) {
    // todo: Open this in a modal
    $location.search(queryString);
    e.preventDefault();
  }

  function closeContextDropdownMenu(toggleButton) {
    var dropdownSpan = $(toggleButton).closest('span.dropdown');
    if (dropdownSpan && dropdownSpan.hasClass('open')) {
      dropdownSpan.removeClass('open');
      toggleButton.setAttribute('aria-expanded', false);
    }
  }

  $scope.$on('spModel.fields.rendered', function() {
    if (ctrl.panels)
      ctrl.panels.removeClass('shift-out').addClass('shift-in');
    var toggleButton = document.getElementById('adminMenu');
    if (!toggleButton)
      return;
    var dropdownMenu = toggleButton.nextElementSibling;
    toggleButton.addEventListener('keydown', function(event) {
      if (event.key === 'Tab') 
          closeContextDropdownMenu(toggleButton);	
    });

    if (dropdownMenu) {
      dropdownMenu.addEventListener('focusout', function(event) {
          if (!dropdownMenu.contains(event.relatedTarget)) 
              closeContextDropdownMenu(toggleButton);
      });
    }
  });

	var g_form;
	function initForm(gFormInstance) {
              $scope.$evalAsync(function() {
		     if ($('#widget-form').parents('.modal').length) {
		        $scope.embeddedInModal = true;
		     }
		})

		if (gFormInstance.getTableName() == $scope.data.f.table){
			g_form = gFormInstance;
			spNavStateManager.register($scope.data.table, _save, g_form);
			$scope.isPageReady = true;
			$timeout(function() {
				$rootScope.$emit('spModel.gForm.rendered', g_form);
			}, 175);
		}
	}

  $scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
		initForm(gFormInstance);
  });

	$scope.$on('spModel.gForm.env.created', function(e, gFormInstance) {
		initForm(gFormInstance);
  });

	// update the comments or worknotes based on activity stream
	$scope.$on("activity_stream_is_changed", function(event, data) {
		if (g_form && g_form.hasField(data.fieldName)) {
			g_form.setValue(data.fieldName, data.input);
			if (data.fieldToClear != "" && g_form.hasField(data.fieldToClear))
				g_form.setValue(data.fieldToClear, "");
		}
	})

  // Show or hide related lists
  $scope.$watch('data.f._related_lists', function() {
    $scope.data.hideRelatedLists = hideRelatedLists();
  }, true);

	$scope.hideDuplicateSaveAction = function (item) {
		if (!$scope.data.advancedUIEnabled)
			return true;
		return ($scope.data.advancedUIEnabled && item.sys_id !== "432ace8b0a0a0b34006b02832660c894" && item.sys_id !== "42e780d40a0a0b34007e0d4a52d33405");
	};

  function hideRelatedLists() {
    if (!$scope.data.f._related_lists)
      return true;
    if ($scope.options.hideRelatedLists == true)
      return true;
    if ($scope.data.sys_id == '-1')
      return true;
    // If all related lists are visible=false then hide
    if ($scope.data.f._related_lists.length > 0) {
      for (var i in $scope.data.f._related_lists) {
        var list = $scope.data.f._related_lists[i];
        if (list.visible) {
          return false;
        }
      }
    }
    return true;
  }

  // DEF0523212 - update attachment count in related lists when attachments are updated
  if ($scope.data.f._related_lists) {
    var attachmentsPosInRelatedLists = $scope.data.f._related_lists.findIndex((rl) => {
      return rl.table === 'sys_attachment';
    });

    $scope.$on('sp.attachments.recount', function(e, attachmentsLength) {
      if (attachmentsPosInRelatedLists != undefined && attachmentsPosInRelatedLists != -1)
        $scope.data.f._related_lists[attachmentsPosInRelatedLists].count = attachmentsLength;
    });
  }

  function clearStatus() {
    $scope.status = "";
  }

  function setupAttachmentHandler() {
    $scope.attachmentHandler = new nowAttachmentHandler(appendDone, appendError);

		$scope.$evalAsync(function() {
			$scope.attachmentHandler.setParams($scope.data.table, $scope.data.f._attachmentGUID, 1024 * 1024 * $scope.data.maxAttachmentSize);
		});

    $scope.$on('dialog.upload_too_large.show', function(e) {
      $log.error($scope.data.largeAttachmentMsg);
      spUtil.addErrorMessage($scope.data.largeAttachmentMsg);
    });
  }
  setupAttachmentHandler();

  function appendDone() {
    // don't know here whether upload succeeded, so can't show msg either way
    $scope.$broadcast("sp.attachments.update", $scope.data.f._attachmentGUID);
    spUtil.retrieveSessionMessages();
  }

  function appendError(error) {
    $scope.errorMessages.push(error);
    spUtil.addErrorMessage(error.msg + error.fileName);
  }

  if ($scope.data.f.title) {
	  $scope.$emit('sp.widget-modal.set-aria-label', $scope.data.f.title);
  }

  $scope.cancel = function(){
  	$scope.$parent.$dismiss();
  }
  
  // Initialize keyboard navigation for admin menu hamburger after DOM is ready
  $timeout(function() {
    var adminMenuElement = $element.find("#adminMenu").parent();
    if (adminMenuElement.length > 0) {
      spAriaUtil.initDropdownKeyboardNav(adminMenuElement);
    }
  });
}
