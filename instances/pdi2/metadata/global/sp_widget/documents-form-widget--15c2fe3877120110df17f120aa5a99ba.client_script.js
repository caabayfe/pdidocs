function($rootScope, $scope, spModal, $timeout, $location, $log, $window, spUtil, nowAttachmentHandler, spAriaUtil, spNavStateManager) {
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
    spUtil.recordWatch($scope, "sys_attachment", "table_sys_id=" + tableId, function(response, data) {
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

    $rootScope.$on('$sp.html.editor.progress', function(e, conf) {
        $scope.submitting = conf.state;
    });

    $rootScope.$emit('form.widget.scope.destroy', $scope);

    $scope.getButtonClass = function(action) {
        if (action.form_style == "destructive")
            return "btn-danger";

        if (action.form_style == "primary")
            return "btn-primary";

        return "btn-default";
    };

    $scope.navigateBack = function() {
        $rootScope.$broadcast('form.widget.back.click');
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
        if ($scope.data.disableUIActions)
            return null;
        var primaryActions = $scope.data.f._ui_actions.filter(function(action) {
            if ($scope.data.setSavePrimary && action.action_name === 'sysverb_update')
                return true;
            return action.primary;
        });
        return (primaryActions.length) ? primaryActions[0] : null;
    }

    $scope.getUIActionContextMenu = function(event) {
        var menu = [];
        if (event.ctrlKey)
            return menu;

        var contextActions = $scope.getUIActions('context');
        contextActions.forEach(function(action) {
            menu.push([action.name, function() {
                $scope.triggerUIAction(action);
            }]);
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
            $scope.triggerUIAction(primaryAction);
    });
    $scope.$on('$destroy', function() {
        deregister()
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
                $scope.submitting = true;
                if (!g_form.submit(action.action_name || action.sys_id))
                    $scope.submitting = false;
            }
        });
    }

    $scope.$on("spModel.uiActionComplete", function(evt, response, savedFormSysId) {
        if (!response.isInsert && ($scope.data.sys_id !== savedFormSysId))
            return;

        $scope.submitting = false;
        if (response.isActionAborted)
            return;

        var sysID = (response.isInsert) ? response.sys_id : $scope.data.sys_id;
        loadForm($scope.data.table, sysID).then(constructResponseHandler(response));
    });

    function constructResponseHandler(response) {
        return function() {
            $rootScope.$broadcast("sp.form.submitted", {
                sys_id: (response.isInsert) ? response.sys_id : $scope.data.sys_id
            });
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
    })

    function _save() {
        var primaryAction = $scope.getPrimaryAction();
        if (primaryAction)
            $scope.triggerUIAction(primaryAction);
    }

    function onListClick(evt, arg) {
        loadForm(arg.table, arg.sys_id);
    }

    function loadForm(table, sys_id) {
        var f = {};
        $scope.data.table = f.table = table;
        $scope.data.sys_id = f.sys_id = sys_id;
        f.view = $scope.data.view;
        return $scope.server.update().then(setupAttachmentHandler);
    }

    $scope.openRelatedList = function(e, queryString) {
        // todo: Open this in a modal
		e.preventDefault();
        $rootScope.$broadcast('spModel.versions.clicked', queryString);
        
    }

    $scope.$on('spModel.fields.rendered', function() {
        if (ctrl.panels)
            ctrl.panels.removeClass('shift-out').addClass('shift-in');
    });

    var g_form;

    function initForm(gFormInstance) {
        $scope.$evalAsync(function() {
            if ($('#widget-form').parents('.modal').length)
                $scope.embeddedInModal = true;
        })

        if (gFormInstance.getTableName() == $scope.data.f.table) {
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

    $scope.hideDuplicateSaveAction = function(item) {
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
}
