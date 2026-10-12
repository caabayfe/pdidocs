angular.module("sn.chg_soc.style", ["sn.common", "ui.bootstrap", "sn_chg_soc_cp.snColorPicker", "sn.chg_soc.data"])
	.constant("STYLE", {
		TRACKING_KEY: {
			CREATE: "Create Change Schedule Style",
			UPDATE: "Update Change Schedule Style",
			UPDATE_NAME: "Update Change Schedule Style Name",
			UPDATE_COLOR: "Update Change Style Color",
			DELETE: "Delete Change Schedule Style"
		},
		EVENT: {
			DELETED: ""
		},
		SERVICE: {
			GET_CONDITION: "/api/sn_chg_soc/soc/getreadablecondition?sysparm_ck=",
			UPDATE: "/api/sn_chg_soc/soc/updatestylerule?sysparm_ck=",
			DELETE: "/api/sn_chg_soc/soc/deletestylerule?sysparm_ck=",
			UPDATE_SCHEDULE: "/api/sn_chg_soc/soc/updatechgdefstyle?sysparm_ck="
		},
		TYPE: {
			SCHEDULE: "schedule"
		}
	})
	.service("styleService", ["dataService", "i18n", "$q", "$http", "$window", "$document", "STYLE", "SOC", function(dataService, i18n, $q, $http, $window, $document, STYLE, SOC) {
		var styleService = this;

		styleService.definition = "";
		styleService.canCreate = false;
		styleService.selectedStyle = {};
		styleService.styles = {
			schedule: [],
			chg_soc_style_rule: [],
			chg_soc_definition_style_rule: [],
			chg_soc_def_child_style_rule: []
		};

		styleService.addStyle = function(style) {
			styleService.styles[style.sys_class_name.value].push(style);
		};

		styleService.initStyle = function() {
			styleService.definition = dataService.definition;
			styleService.canCreate = dataService.definition.__security.canWrite;

			if (dataService.definition.show_blackout.value)
				addScheduleStyle("blackout", i18n.getMessage("Blackout"), dataService.definition.blackout_span_color.value ? dataService.definition.blackout_span_color.value : SOC.BLACKOUT_SPAN_COLOR, dataService.definition.sys_id.value, "blackout_span_color", dataService.definition.__security);
			if (dataService.definition.show_maintenance.value)
				addScheduleStyle("maintenance", i18n.getMessage("Maintenance"), dataService.definition.maintenance_span_color.value ? dataService.definition.maintenance_span_color.value : SOC.MAINT_SPAN_COLOR, dataService.definition.sys_id.value, "maintenance_span_color", dataService.definition.__security);

			for (var chgSocStyleId in dataService.style.chg_soc_style_rule)
				styleService.addStyle(dataService.style.chg_soc_style_rule[chgSocStyleId]);
			for (var chgSocDefStyleId in dataService.style.chg_soc_definition_style_rule)
				styleService.addStyle(dataService.style.chg_soc_definition_style_rule[chgSocDefStyleId]);
			for (var chgSocChildDefStyleId in dataService.style.chg_soc_def_child_style_rule)
				styleService.addStyle(dataService.style.chg_soc_def_child_style_rule[chgSocChildDefStyleId]);
		};

		styleService.updateStyleBasic = function(style) {
			return updateStyle(style);
		};

		styleService.updateStyleAdvanced = function(style, records) {
			return updateStyle(style, records);
		};

		function updateStyle(style, records) {
			var deferred = $q.defer();
			var url = STYLE.SERVICE.UPDATE;
			if (style.__type && style.__type === STYLE.TYPE.SCHEDULE)
				url = STYLE.SERVICE.UPDATE_SCHEDULE;
			url += $window.g_ck;
			$http.post(url, {
				"chgSocDefId": dataService.definition.sys_id.value,
				"style": style,
				"records": records
			}).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		}

		styleService.deleteStyle = function(style, records) {
			var deferred = $q.defer();
			var url = STYLE.SERVICE.DELETE + $window.g_ck;
			$http.post(url, {
				"chgSocDefId": dataService.definition.sys_id.value,
				"style": style,
				"records": records
			}).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		};

		styleService.getReadableCondition = function(config) {
			var deferred = $q.defer();
			var url = STYLE.SERVICE.GET_CONDITION + $window.g_ck;
			for (var key in config)
				url += "&" + key + "=" + config[key];
			$http.get(url, config).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		};

		styleService.updateStyleInSheet = function(style) {
			var result = findStyleSheetByStyle(style);
			if (!result)
				return;
			var spanStyleSheet = result.style_sheet;
			var eventSelector = result.event_selector;
			if (!spanStyleSheet || !eventSelector)
				return;
			var rule;
			for (var j = 0; j < spanStyleSheet.cssRules.length; j++)
				if (eventSelector[spanStyleSheet.cssRules[j].selectorText]) {
					rule = spanStyleSheet.cssRules[j];
					break;
				}
			if (!rule)
				return;
			rule.style["background-color"] = style.event_color.value;
		};

		styleService.removeStyle = function(style) {
			var index = -1;
			for (var i = 0; i < styleService.styles[style.sys_class_name.value].length; i++)
				if (style.sys_id.value === styleService.styles[style.sys_class_name.value][i].sys_id.value) {
					index = i;
					break;
				}
			if (index === -1)
				return;

			styleService.styles[style.sys_class_name.value].splice(index, 1);
			return styleService.styles;
		};

		function addScheduleStyle(id, label, color, defId, fieldName, security) {
			var styleItem = {
				sys_id: {
					display_value: id,
					value: id
				},
				name: {
					display_value: label,
					value: fieldName
				},
				event_color: {
					display_value: color,
					value: color
				},
				condition: {
					display_value: "",
					value: ""
				},
				__def_id: defId,
				__security: security,
				__type: STYLE.TYPE.SCHEDULE
			};
			styleService.styles.schedule.push(styleItem);
		}

		function findStyleSheetByStyle(style) {
			var scheduleStyle = {
				blackout: "blackout",
				maintenance: "maint"
			};

			var spanStyleSheetId = "soc_span_style";
			var eventSelector = {};
			eventSelector["div.soc_" + style.sys_id.value + " .gantt_task_content"] = true;
			if (style.__type) {
				spanStyleSheetId = "soc_schedule_style";
				eventSelector = {};
				eventSelector["div.schedule-bar." + scheduleStyle[style.sys_id.value]] = true;
				eventSelector["div." + scheduleStyle[style.sys_id.value] + ".schedule-bar"] = true;
			}

			var spanStyleSheet;
			for (var i = 0; i < $document[0].styleSheets.length; i++)
				if ($document[0].styleSheets[i].ownerNode.id === spanStyleSheetId) {
					spanStyleSheet = $document[0].styleSheets[i];
					break;
				}

			return {
				style_sheet: spanStyleSheet,
				event_selector: eventSelector
			};
		}
	}])
	.directive("socAsideStyle", ["getTemplateUrl", "styleService", "SOC", "i18n", function(getTemplateUrl, styleService, SOC, i18n) {
		"use strict";
		return {
			restrict: "A",
			templateUrl: getTemplateUrl("sn_chg_soc_aside_style_body.xml"),
			scope: {
				socDefId: "="
			},
			controller: function($scope) {
				$scope.styles = styleService.styles;

				$scope.canCreate = styleService.canCreate;

				$scope.openStyle = function() {
					$scope.$emit("sn.aside.change_soc_side.open_style", {
						chg_soc_definition: {
							display_value: styleService.definition.name.display_value,
							value: styleService.definition.sys_id.value
						},
						condition: {
							display_value: "",
							value: ""
						},
						event_color: {
							display_value: "rgba(10, 10, 252, 0.5)",
							value: "rgba(10, 10, 252, 0.5)"
						},
						name: {
							display_value: "",
							value: ""
						},
						sys_class_name: {
							display_value: "chg_soc_definition_style_rule",
							value: "chg_soc_definition_style_rule"
						},
						sys_id: {
							display_value: "-1",
							value: "-1"
						},
						__security: {
							canRead: true,
							canWrite: true,
							canDelete: true
						},
					});
				};

				$scope.messages = {
					"Add Span Style": i18n.getMessage("Add Span Style"),
					"Schedules": i18n.getMessage("Schedules"),
					"Style rules": i18n.getMessage("Style rules"),
					"Related style rules": i18n.getMessage("Related style rules")
				};
			}
		};
	}])
	.directive("socAsideStyleItem", ["getTemplateUrl", "$uibModal", function(getTemplateUrl, $uibModal) {
		"use strict";
		return {
			restrict: "A",
			replace: true,
			templateUrl: getTemplateUrl("sn_chg_soc_aside_style_item.xml"),
			scope: {
				socStyle: "=",
				socDefId: "="
			},
			controller: "StyleDefCtrl",
			link: function($scope, $element, $attrs, $controller) {
				$scope.setFocus = function() {
					$element.find(".span-style-name").focus();
				};
			}
		};
	}])
	.controller("StyleDefCtrl", ["$scope", "$document", "$uibModal", "getTemplateUrl", "i18n", "styleService", "socNotification", "dataService", "STYLE", function($scope, $document, $uibModal, getTemplateUrl, i18n, styleService, socNotification, dataService, STYLE) {
		var styleDefCtrl = this;

		$scope.editMode = false;

		$scope.$watch("socStyle.event_color.value", function(newValue, oldValue) {
			if (newValue === oldValue)
				return;
			styleService.updateStyleInSheet($scope.socStyle);
		});

		$scope.openStyle = function($event) {
			if ($scope.editMode || $event.target.className.indexOf("soc-style-list-color-btn") !== -1)
				return;
			$scope.$emit("sn.aside.change_soc_side.open_style", $scope.socStyle);
		};

		$scope.deleteStyle = function($event) {
			$event.stopPropagation();
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: getTemplateUrl("sn_chg_soc_delete_style_def.xml"),
				controller: "DeleteStyleCtrl",
				scope: $scope,
				size: "sm"
			}).result.then(function(result) {
				$scope.$emit("sn.aside.change_soc_side.style_updated", result);
				styleService.removeStyle(result.style);
			});
		};

		$scope.updateStyleName = function($event) {
			$event.stopPropagation();
			$scope.editMode = !$scope.editMode;
			styleService.updateStyleBasic($scope.socStyle).then(function(result) {
				dataService.trackEvent(STYLE.TRACKING_KEY.UPDATE_NAME);
			}).catch(function(response) {
				socNotification.show("error", response.data.error.message);
			});
		};

		$scope.updateStyleColor = function(color) {
			styleService.updateStyleBasic($scope.socStyle).then(function(result) {
				dataService.trackEvent(STYLE.TRACKING_KEY.UPDATE_COLOR);
			}).catch(function(response) {
				socNotification.show("error", response.data.error.message);
			});
		};

		$scope.editName = function($event) {
			$event.stopPropagation();
			$scope.editMode = !$scope.editMode;
		};

		$scope.messages = {
			"More details": i18n.getMessage("More details"),
			"Select span color": i18n.getMessage("Select span color"),
			"Edit span style name": i18n.getMessage("Edit span style name"),
			"Delete span style": i18n.getMessage("Delete span style"),
			"Cancel": i18n.getMessage("Cancel"),
			"Delete": i18n.getMessage("Delete"),
			"Close": i18n.getMessage("Close")
		};
	}])
	.controller("DeleteStyleCtrl", ["$scope", "$uibModalInstance", "i18n", "styleService", "dataService", "socNotification", "STYLE", function($scope, $uibModalInstance, i18n, styleService, dataService, socNotification, STYLE) {
		var deleteStyleCtrl = this;

		$scope.cancel = function() {
			$uibModalInstance.dismiss("cancel");
		};

		$scope.delete = function() {
			var style = $scope.socStyle;
			styleService.deleteStyle(style, dataService.allRecords).then(function(result) {
				if (result) {
					dataService.trackEvent(STYLE.TRACKING_KEY.DELETE);
					result.style = style;
					$scope.$emit("sn.aside.change_soc_side.style_deleted", result);
				}
				$uibModalInstance.close(result);
			}).catch(function(response) {
				socNotification.show("error", response.data.error.message);
				$uibModalInstance.dismiss("cancel");
			});
		};

		$scope.deleteStyleMsg = i18n.format("Do you want to delete \"{0}\"? After deleting this style, any applicable spans will revert to a default span color", $scope.socStyle.name.display_value);
	}])
	.directive("socAsideStyleDef", ["getTemplateUrl", "styleService", "$uibModal", "dataService", "i18n", "STYLE", "socNotification", function(getTemplateUrl, styleService, $uibModal, dataService, i18n, STYLE, socNotification) {
		"use strict";
		return {
			restrict: "E",
			templateUrl: getTemplateUrl("sn_chg_soc_aside_style_def.xml"),
			controller: function($rootScope, $scope) {
				var localDataService = dataService;
				var styleRecord = styleService.selectedStyle;

				$scope.socStyle = angular.copy(styleRecord);

				$scope.$watch("socStyle.event_color.value", function(newValue, oldValue) {
					if (newValue === oldValue)
						return;
					styleService.updateStyleInSheet($scope.socStyle);
				});

				$scope.getFilterBtnLabel = function() {
					if ($scope.socStyle.condition.value === "")
						return $scope.messages["Add filter"];
					return $scope.messages["Edit filter"];
				};

				$scope.saveEnabled = function() {
					return $scope.socStyle.__security.canWrite && isComplete();
				};

				$scope.closeStyleSide = function($event) {
					$event.stopPropagation();
					if (hasChanged()) {
						openConfirmModal(function(result) {
							if (result === "discard") {
								$rootScope.$broadcast("sn.aside.change_soc_side.close");
								styleService.updateStyleInSheet(styleRecord);
							} else if (result === "save")
								$scope.updateStyle($event);
						});
						return;
					}
					styleService.updateStyleInSheet(styleRecord);
					$rootScope.$broadcast("sn.aside.change_soc_side.close");
				};

				$scope.historyBack = function($event) {
					$event.stopPropagation();
					if (hasChanged()) {
						openConfirmModal(function(result) {
							if (result === "discard") {
								styleService.updateStyleInSheet(styleRecord);
								$rootScope.$broadcast("sn.aside.change_soc_side.historyBack");
							} else if (result === "save")
								$scope.updateStyle($event);
						});
						return;
					}
					styleService.updateStyleInSheet(styleRecord);
					$rootScope.$broadcast("sn.aside.change_soc_side.historyBack");
				};

				$scope.openFilterControl = function($event) {
					$event.stopPropagation();
					$uibModal.open({
						animation: true,
						templateUrl: getTemplateUrl("sn_chg_soc_snSocConditionBuilderTemplate.xml"),
						controller: "FilterStyleCtrl",
						scope: $scope,
						size: "lg"
					}).result.then(function(condition) {
						$scope.socStyle.condition.display_value = condition.display_value;
						$scope.socStyle.condition.value = condition.value;
					});
				};

				$scope.updateStyle = function($event) {
					// Changing schedule style only proceed if color has changed
					if (styleRecord.__type === STYLE.TYPE.SCHEDULE && styleRecord.event_color.value === $scope.socStyle.event_color.value)
						return;

					// Changing style rule only proceed if name, color or condition have changed
					if (styleRecord.__type !== STYLE.TYPE.SCHEDULE && !hasChanged())
						return;

					// Update the record. Name and color can be changed locally
					if (styleRecord.__type === STYLE.TYPE.SCHEDULE || styleRecord.condition.value === $scope.socStyle.condition.value) {
						styleService.updateStyleBasic($scope.socStyle).then(function(result) {
							dataService.trackEvent(STYLE.TRACKING_KEY.UPDATE);
							updateLocalStyle($scope.socStyle);
							$scope.historyBack($event);
						}).catch(function(response) {
							socNotification.show("error", response.data.error.message);
						});
						return;
					}

					// Update the record and ensure records are updated as we are changing condition
					styleService.updateStyleAdvanced($scope.socStyle, localDataService.allRecords).then(function(result) {
						if (typeof result === "object") {
							dataService.trackEvent(STYLE.TRACKING_KEY.CREATE);
							$scope.$emit("sn.aside.change_soc_side.style_updated", result);
							updateLocalStyle($scope.socStyle);
							// Only add the style if it a new record
							if ($scope.socStyle.sys_id.value === "-1" && result.style)
								styleService.addStyle(result.style);
							$scope.historyBack($event);
						}
					}).catch(function(response) {
						socNotification.show("error", response.data.error.message);
					});
				};

				$scope.deleteStyle = function($event) {
					$event.stopPropagation();
					$uibModal.open({
						animation: true,
						templateUrl: getTemplateUrl("sn_chg_soc_delete_style_def.xml"),
						controller: "DeleteStyleCtrl",
						scope: $scope,
						size: "sm"
					}).result.then(function(result) {
						$scope.$emit("sn.aside.change_soc_side.style_updated", result);
						styleService.removeStyle(result.style);
						$scope.historyBack($event);
					});
				};

				$scope.messages = {
					"Delete span style": i18n.getMessage("Delete span style"),
					"Cancel": i18n.getMessage("Cancel"),
					"Save": i18n.getMessage("Save"),
					"Delete": i18n.getMessage("Delete"),
					"Back to span styles": i18n.getMessage("Back to span styles"),
					"Select span color": i18n.getMessage("Select span color"),
					"Span Style": i18n.getMessage("Span Style"),
					"Close span style panel": i18n.getMessage("Close span style panel"),
					"The Basics": i18n.getMessage("The Basics"),
					"Name": i18n.getMessage("Name"),
					"Span color": i18n.getMessage("Span color"),
					"Applied filter": i18n.getMessage("Applied filter"),
					"Add filter": i18n.getMessage("Add filter"),
					"Edit filter": i18n.getMessage("Edit filter"),
					// Used by filter template
					"Title": i18n.getMessage("Style rule filter"),
					"Close": i18n.getMessage("Close"),
					"Submit": i18n.getMessage("Save"),
				};

				function isComplete() {
					if (styleRecord.__type === STYLE.TYPE.SCHEDULE)
						return $scope.socStyle.event_color.value;
					return $scope.socStyle.name.display_value && $scope.socStyle.event_color.value && $scope.socStyle.condition.value;
				}

				function hasChanged() {
					return styleRecord.name.display_value !== $scope.socStyle.name.display_value
						|| styleRecord.event_color.value !== $scope.socStyle.event_color.value
						|| styleRecord.condition.value !== $scope.socStyle.condition.value;
				}

				function updateLocalStyle(style) {
					styleRecord.event_color.value = style.event_color.value;
					if (styleRecord.__type !== STYLE.TYPE.SCHEDULE) {
						styleRecord.name.display_value = style.name.display_value;
						styleRecord.condition.display_value = style.condition.display_value;
						styleRecord.condition.value = style.condition.value;
					}
				}

				function openConfirmModal(onClose, onDismiss) {
					$uibModal.open({
						animation: true,
						templateUrl: getTemplateUrl("sn_chg_soc_nav_style_def.xml"),
						controller: "ConfirmNavCtrl",
						scope: $scope,
						size: "sm"
					}).result.then(onClose, onDismiss);
				}
			}
		};
	}])
	.controller("FilterStyleCtrl", ["$scope", "$uibModalInstance", "styleService", "socNotification", "i18n", function($scope, $uibModalInstance, styleService, socNotification, i18n) {
		var filterStyleCtrl = this;

		$scope.showSubmit = true;
		$scope.table = "change_request";
		$scope.filterConfig = {
			dotWalking	: false,
			testFilter  : false,
			closeFilter : false,
			runFilter   : false,
			saveFilter  : false,
			loadFilter  : false,
			sortFilter  : false,
			clearFilter : false,
			outputType  : "encoded_query",
			encodedQuery: $scope.socStyle.condition.value
		};

		$scope.condition = $scope.socStyle.condition.value;

		$scope.$on("snfilter:update_query", function(currentScope, queryString) {
			$scope.condition = queryString.replace("^ORDERBYundefined", "");
		});

		$scope.enableSubmit = function() {
			return $scope.condition !== "" && !$scope.condition.startsWith("^ORDERBY");
		};

		$scope.cancel = function() {
			$uibModalInstance.dismiss("cancel");
		};

		$scope.submit = function() {
			styleService.getReadableCondition({
				"table": $scope.socStyle.sys_class_name.value,
				"field": "condition",
				"encoded_query": $scope.condition
			}).then(function(result) {
				if (result)
					$uibModalInstance.close({
						display_value: result,
						value: $scope.condition
					});
			}).catch(function(response) {
				socNotification.show("error", response.data.error.message, 0, null, ".soc-condition-builder-modal-message");
			});
		};
	}])
	.controller("ConfirmNavCtrl", ["$scope", "$uibModalInstance", "i18n", function($scope, $uibModalInstance, i18n) {
		var confirmNavCtrl = this;

		$scope.dismiss = function() {
			$uibModalInstance.dismiss();
		};

		$scope.save = function() {
			$uibModalInstance.close("save");
		};

		$scope.discard = function() {
			$uibModalInstance.close("discard");
		};

		$scope.bodyMsg = i18n.format("Do you want to save changes to '{0}' before leaving this Span Style rule?", $scope.socStyle.name.display_value);

		$scope.messages = {
			"Discard": i18n.getMessage("Discard"),
			"Save": i18n.getMessage("Save"),
			"Save changes": i18n.getMessage("Save changes")
		};
	}]);
