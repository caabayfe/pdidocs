angular.module("sn.chg_soc.context_menu", ["sn.common"])
    .constant("CONTEXT_MENU", {
		"TRACKING_KEY": {
			"CREATE": "Create Change Schedule",
			"COPY": "Copy Change Schedule",
			"EDIT": "Edit Change Schedule",
			"OPEN_SCHEDULE_DEFINITION": "Redirect to Change Schedule Definition",
			"DELETE": "Delete Change Schedule"
		},
        "CHG_DEF_FORM": "chg_soc_definition.do",
        "CHG_SCHED_PAGE": "sn_chg_soc_change_soc.do",
        "CHG_DEF_LANDING": "sn_chg_soc_landing.do",
        "REST_API": {
            "COPY_SCHEDULE": "/api/sn_chg_soc/soc/copySchedule",
            "DELETE_SCHEDULE": "/api/sn_chg_soc/soc/deleteSchedule",
            "UPDATE_SCHEDULE": "/api/sn_chg_soc/soc/updateSchedule",
            "CHG_DATE_OPTIONS": "/api/sn_chg_soc/soc/gettablefields"
        },
        "KEYS": {
            "TABKEY": 9,
            "ENTER": 13,
            "ESCAPE": 27,
            "UP": 38,
            "DOWN": 40
        }
    })
    .directive("focusMenuItem", function($timeout) {
        return {
            scope: {
                trigger: "@focusMenuItem"
            },
            link: function(scope, element) {
                scope.$watch("trigger", function(value) {
                    if (value === "true")
                        $timeout(function() {
                            element.find("li")[0].focus();
                        });
                });
            }
        };
    })
    .directive("trapFocus", function(CONTEXT_MENU, $timeout) {
        return {
            restrict: "A",
            link: function($scope, $element, $attr) {
                function closeContextMenu() {
                    $scope.$parent.contextMenuCtrl.contextMenu.open = false;
                    $scope.$parent.$apply();
                    angular.element("#btnContextMenu").focus();
                }

                $element.on("keyup", function(event) {
                    if (event.keyCode === CONTEXT_MENU.KEYS.ESCAPE) {
                        event.stopPropagation();
                        event.preventDefault();
                        closeContextMenu();
                    }
                });
                $element.on("keydown", function(event) {
                    var list = $element.find("li");
                    var focused = angular.element(document.activeElement);
                    var nav = focused.parents('[trap-focus]');
                    if (nav.length) {
                        event.preventDefault();
                        var index, next;
                        if (typeof index === "undefined")
                            index = list.index(focused);
                        if (event.keyCode === CONTEXT_MENU.KEYS.DOWN)
                            index = (index === list.length - 1) ? list.length - 1 : index + 1;
                        else if (event.keyCode === CONTEXT_MENU.KEYS.UP)
                            index = (index === 0) ? 0 : index - 1;
                        next = list.get(index);
                        if (next)
                            next.focus();
                    }
                });
            }
        };
    })
    .directive("snSocContextMenu", ["$window", "$timeout", "$uibModal", "getTemplateUrl", "dataService", function($window, $timeout, $uibModal, getTemplateUrl, dataService) {
        "use strict";

        return {
            restrict: "E",
            replace: true,
            templateUrl: getTemplateUrl("sn_chg_soc_context_menu_buttons.xml"),
            controller: "ContextMenuCtrl",
            controllerAs: "contextMenuCtrl",
            bindToController: true
        };
    }])
    .controller("ContextMenuCtrl", ["$scope", "$window", "$timeout", "$uibModal", "$location", "getTemplateUrl", "dataService", "recordService", "i18n", "CONTEXT_MENU", function($scope, $window, $timeout, $uibModal, $location, getTemplateUrl, dataService, recordService, i18n, CONTEXT_MENU) {
        var contextMenuCtrl = this;

        contextMenuCtrl.backToChangeSchedules = function() {
            recordService.redirectToChangeSchedules();
        };

        contextMenuCtrl.contextMenu = {
            showCreate: false,
            showDelete: false,
            showEdit: false,
            showCopy: false,
            open: false,
            template: getTemplateUrl("sn_chg_soc_context_menu.xml")
        };

        contextMenuCtrl.toggleContextMenu = function() {
            contextMenuCtrl.contextMenu.showCreate = dataService.canCreate();
            contextMenuCtrl.contextMenu.showDelete = dataService.canDelete();
            contextMenuCtrl.contextMenu.showEdit = dataService.canWrite();
            contextMenuCtrl.contextMenu.showCopy = dataService.canCreate();
            contextMenuCtrl.contextMenu.open = !contextMenuCtrl.contextMenu.open;
        };

        $scope.$on("sn.change_soc_wizard:opened", function() {
            contextMenuCtrl.contextMenu.open = false;
        });

        contextMenuCtrl.toggleCopySchedule = function() {
            contextMenuCtrl.contextMenu.open = false;
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: "copy-change-schedule-title",
                ariaDescribedBy: "copy-change-schedule-modal-body",
                templateUrl: getTemplateUrl("sn_chg_soc_copy_change_schedule.xml"),
                controller: "CopyChangeModelCtrl",
                controllerAs: "copyChangeModelCtrl",
                bindToController: true
            });
        };

        contextMenuCtrl.toggleEditSchedule = function() {
            contextMenuCtrl.contextMenu.open = false;
            $uibModal.open({
                animation: true,
                size: "lg",
                ariaLabelledBy: "edit-change-schedule-title",
                ariaDescribedBy: "edit-change-schedule-modal-body",
                templateUrl: getTemplateUrl("sn_chg_soc_editSchedule.xml"),
                controller: "EditChangeModelCtrl",
                controllerAs: "editChangeModelCtrl",
                scope: $scope
            });
        };

        contextMenuCtrl.redirectToChangeScheduleDef = function() {
            contextMenuCtrl.contextMenu.open = false;
            var chgSocSysId = dataService.definition.sys_id.value;
            if (chgSocSysId)
                $timeout(function() {
					dataService.trackEvent(CONTEXT_MENU.TRACKING_KEY.OPEN_SCHEDULE_DEFINITION);
                    $window.location.href = CONTEXT_MENU.CHG_DEF_FORM + "?sys_id=" + chgSocSysId;
                }, 150);
        };

        contextMenuCtrl.deleteChangeSchedules = function() {
            contextMenuCtrl.contextMenu.open = false;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: getTemplateUrl("sn_chg_soc_remove_schedule_def.xml"),
                controller: "removeScheduleCtrl",
                scope: $scope,
                size: "sm"
            });
        };

        contextMenuCtrl.messages = {
            "Back to change schedules": i18n.getMessage("Back to change schedules"),
            "Open context menu": i18n.getMessage("Open context menu"),
            "Create New Schedule": i18n.getMessage("Create New Schedule"),
            "Edit Schedule": i18n.getMessage("Edit Schedule"),
            "Copy Schedule": i18n.getMessage("Copy Schedule"),
            "View Schedule Definition": i18n.getMessage("View Schedule Definition"),
            "Delete": i18n.getMessage("Delete")
        };

    }])
    .controller("removeScheduleCtrl", ["$scope", "$uibModalInstance", "i18n", "dataService", "recordService", "CONTEXT_MENU", function($scope, $uibModalInstance, i18n, dataService, recordService, CONTEXT_MENU) {

        $scope.deleteDefMsg = i18n.format("Do you want to delete \"{0}\"?", dataService.definition.name.display_value);

        $scope.messages = {
            "Delete change schedule": i18n.getMessage("Delete change schedule"),
            "Cancel": i18n.getMessage("Cancel"),
            "Delete": i18n.getMessage("Delete")
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };

        $scope.delete = function() {
            recordService.deleteSchedule().then(function(response) {
                $uibModalInstance.dismiss("cancel");
                if (response.chg_soc_definition && response.removed) {
					dataService.trackEvent(CONTEXT_MENU.TRACKING_KEY.DELETE);
					recordService.redirectToChangeSchedules();
				}
                else
                    console.error(response.error);
            });
        };

    }])
    .controller("CopyChangeModelCtrl", ["$uibModalInstance", "$window", "i18n", "dataService", "recordService", "CONTEXT_MENU", function($uibModalInstance, $window, i18n, dataService, recordService, CONTEXT_MENU) {
        var copyChangeModelCtrl = this;

        var _initialFileName = i18n.format("{0} (Copy)", dataService.definition.name.display_value);

        copyChangeModelCtrl.form = {
            name: _initialFileName,
            placeholder: _initialFileName
        };

        copyChangeModelCtrl.close = function() {
            $uibModalInstance.dismiss("cancel");
        };

        copyChangeModelCtrl.copy = function() {
            $uibModalInstance.dismiss("cancel");
            var copyName = copyChangeModelCtrl.form.name;
            var owner = $window.NOW.user.userID;
            if (!copyName || !owner)
                return;
            recordService.copySchedule(copyName, owner).then(function(response) {
                var sysId = response.chg_soc_definition;
                if (sysId && response.copied) {
					dataService.trackEvent(CONTEXT_MENU.TRACKING_KEY.COPY);
					$window.location.href = CONTEXT_MENU.CHG_SCHED_PAGE + "?sysparm_id=" + sysId + "&sysparm_redirect=" + encodeURIComponent(CONTEXT_MENU.CHG_DEF_LANDING);
				}
                else
                    console.error(response.error);
            });
        };

        copyChangeModelCtrl.messages = {
            "Copy change schedule": i18n.getMessage("Copy change schedule"),
            "Copy": i18n.getMessage("Copy"),
            "Cancel": i18n.getMessage("Cancel"),
            "Close": i18n.getMessage("Close"),
            "Name": i18n.getMessage("Name"),
            "{0} (Copy)": i18n.getMessage("{0} (Copy)")
        };

    }])
    .controller("EditChangeModelCtrl", ["$window", "$timeout", "$scope", "$uibModalInstance", "dataService", "recordService", "i18n", "CONTEXT_MENU", "socNotification", function($window, $timeout, $scope, $uibModalInstance, dataService, recordService, i18n, CONTEXT_MENU, socNotification) {
        var editChangeModelCtrl = this;

        editChangeModelCtrl.field = {};
        editChangeModelCtrl.field.name = dataService.definition.name.display_value;
        editChangeModelCtrl.field.expandFilter = false;
        editChangeModelCtrl.field.conditionDisplayValue = dataService.definition.condition.display_value;
        editChangeModelCtrl.showSubmit = true;
        editChangeModelCtrl.messages = {
            "Close": i18n.getMessage("Close"),
            "Title": i18n.getMessage("Edit Schedule"),
            "Name": i18n.getMessage("Name"),
            "Start date field": i18n.getMessage("Start date field"),
            "End date field": i18n.getMessage("End date field"),
            "Conditions": i18n.getMessage("Conditions"),
            "Show or hide filter": i18n.getMessage("Show or hide filter"),
            "Run": i18n.getMessage("Run"),
            "Cancel": i18n.getMessage("Cancel"),
            "Submit": i18n.getMessage("Submit")
        };

        editChangeModelCtrl.field.startDateOptions = [];
        editChangeModelCtrl.field.endDateOptions = [];

        editChangeModelCtrl.enableSubmit = function() {
            return $scope.condition !== "" && !$scope.condition.startsWith("^ORDERBY");
        };

        editChangeModelCtrl.enableRun = function() {
            return false;
        };

        editChangeModelCtrl.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };

        editChangeModelCtrl.submit = function() {
            var changeScheduleDefinition = {
                name: editChangeModelCtrl.field.name,
                start_date_field: editChangeModelCtrl.field.selectedStartDate,
                end_date_field: editChangeModelCtrl.field.selectedEndDate,
                condition: $scope.condition
            };
            recordService.updateSchedule(changeScheduleDefinition).then(function(result) {
                if (result && result.updated) {
                    $uibModalInstance.close();
                    $timeout(function() {
						dataService.trackEvent(CONTEXT_MENU.TRACKING_KEY.EDIT);
                        $window.location.href = CONTEXT_MENU.CHG_SCHED_PAGE + "?sysparm_id=" + dataService.definition.sys_id.value;
                    }, 150);
                } else
                    socNotification.show("error", i18n.getMessage("Failed to update the Change Schedule"), 0, null, ".soc-condition-builder-modal-message");
            }).catch(function(response) {
                socNotification.show("error", response.data.error.message, 0, null, ".soc-condition-builder-modal-message");
            });
        };

        var populateSelectField = function() {
            recordService.getDateTypeFields().then(function(result) {
                result.forEach(function(option) {
                    editChangeModelCtrl.field.startDateOptions.push(option);
                    editChangeModelCtrl.field.endDateOptions.push(option);
                });
                editChangeModelCtrl.field.selectedStartDate = dataService.definition.start_date_field.value || "start_date";
                editChangeModelCtrl.field.selectedEndDate = dataService.definition.end_date_field.value || "end_date";
            });
        };

        populateSelectField();

        $timeout(function() {
            angular.element("#name").focus();
        }, 0);

        $scope.table = "change_request";
        $scope.condition = dataService.definition.condition.value;
        $scope.filterConfig = {
            dotWalking: false,
            testFilter: false,
            closeFilter: false,
            runFilter: false,
            saveFilter: false,
            loadFilter: false,
            sortFilter: true,
            clearFilter: false,
            outputType: "encoded_query",
            encodedQuery: dataService.definition.condition.value
        };

        $scope.$on("snfilter:update_query", function(currentScope, queryString) {
            $scope.condition = queryString.replace("^ORDERBYundefined", "");
        });

    }])
    .service("recordService", ["$http", "$q", "$window", "$location", "dataService", "CONTEXT_MENU", function($http, $q, $window, $location, dataService, CONTEXT_MENU) {
        var recordService = this;
		recordService.source = "";

        var _sortArray = function(arr) {
            arr.sort(function(a, b) {
                if (a.label < b.label)
                    return -1;
                if (a.label > b.label)
                    return 1;
                return 0;
            });
            return arr;
        };

        var _buildOptions = function(arr) {
            var options = [];
            arr.forEach(function(elem) {
                options.push({
                    label: elem.label,
                    value: elem.columnName
                });
            });
            return options;
        };

        var _getParam = function(param) {
            var params = $location.search();
            if (params[param] && typeof params[param] === "string")
                return params[param].toLowerCase();
            return "$none$";
        };

        recordService.getDateTypeFields = function() {
            var deferred = $q.defer();
            var url = CONTEXT_MENU.REST_API.CHG_DATE_OPTIONS + "?sysparm_ck=" + $window.g_ck + "&type=date";
            $http.get(url).then(function(response) {
                deferred.resolve(_buildOptions(_sortArray(response.data.result)));
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        recordService.redirectToChangeSchedules = function() {
            $window.location.href = $window.NOW.sn_chg_soc.redirect;
        };

        recordService.updateSchedule = function(changeSocDefinition) {
            var deferred = $q.defer();
            var url = CONTEXT_MENU.REST_API.UPDATE_SCHEDULE + "?sysparm_ck=" + $window.g_ck;
            changeSocDefinition.chg_soc_definition = dataService.definition.sys_id.value;
            $http.post(url, changeSocDefinition).then(function(response) {
                deferred.resolve(response.data.result);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        recordService.copySchedule = function(name, userSysId) {
            var deferred = $q.defer();
            var url = CONTEXT_MENU.REST_API.COPY_SCHEDULE + "?sysparm_ck=" + $window.g_ck;
            $http.post(url, {
                chg_soc_definition: dataService.definition.sys_id.value,
                name: name,
                owner: userSysId
            }).then(function(response) {
                deferred.resolve(response.data.result);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        recordService.deleteSchedule = function() {
            var deferred = $q.defer();
            var url = CONTEXT_MENU.REST_API.DELETE_SCHEDULE + "?sysparm_ck=" + $window.g_ck;
            $http.post(url, {
                chg_soc_definition: dataService.definition.sys_id.value
            }).then(function(response) {
                deferred.resolve(response.data.result);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
	}]);
