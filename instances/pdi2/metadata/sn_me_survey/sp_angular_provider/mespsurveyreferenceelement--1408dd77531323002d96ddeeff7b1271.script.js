function($timeout, $http, urlTools, filterExpressionParser, $sanitize, i18n, spIs) {
	"use strict";

	return {
		restrict: 'E',
		replace: true,
		scope: {
			ed: "=?",
			field: "=",
			refTable: "=?", // comes from this table
			refId: "=?", // and this sys_id
			snOptions: "=?",
			snOnBlur: "&",
			snOnClose: "&",
			minimumInputLength : "@",
			snDisabled: "=",
			dropdownCssClass: "@",
			formatResultCssClass: "&",
			displayColumn: "@",
			recordValues: '&',
			getGlideForm: '&glideForm',
			domain: "@",
			snSelectWidth: '@', // Width of the selector. Default to 100%.
		},
		template: '<input type="text" name="{{field.name}}" ng-disabled="snDisabled" style="min-width: 150px;" />',
		link: function(scope, element, attrs, ctrl) {
			scope.ed = scope.ed || scope.field.ed;
			scope.selectWidth = scope.snSelectWidth || '100%';
			element.css("opacity", 0);
			var fireReadyEvent = true;
			var g_form;
			var displayColumns;
			var field = scope.field;
			var isMultiple = scope.snOptions && scope.snOptions.multiple === true;
			if (angular.isDefined(scope.getGlideForm))
				g_form = scope.getGlideForm();

			var fieldAttributes = {};
			if (angular.isDefined(scope.field) && angular.isDefined(scope.field.attributes) && typeof scope.ed.attributes == 'undefined')
				if (Array.isArray(scope.field.attributes))
					fieldAttributes = scope.field.attributes;
				else
					fieldAttributes = parseAttributes(scope.field.attributes);
			else
				fieldAttributes = parseAttributes(scope.ed.attributes);

			if (angular.isDefined(fieldAttributes['ref_ac_columns']))
				displayColumns = fieldAttributes['ref_ac_columns'];

			var s2Helpers = {
				formatSelection: function(item) {
					return $sanitize(getDisplayValue(item));
				},
				formatResult: function(item) {
					var displayValues = getDisplayValues(item);
					if (displayValues.length == 1)
						return $sanitize(displayValues[0]);
					if (displayValues.length > 1) {
						var width = 100 / displayValues.length;
						var markup = "";
						for (var i = 0; i < displayValues.length; i++)
							markup += "<div style='width: " + width + "%;' class='select2-result-cell'>" + $sanitize(displayValues[i])  + "</div>";
						return markup;
					}
					return "";
				},

				search: function(queryParams) {
					var url = urlTools.getURL('sp_ref_list_data');
					return $http.post(url, queryParams.data).then(queryParams.success);
				},

				initSelection: function(elem, callback) {
					if (scope.field.displayValue) {
						if (isMultiple) {
							var items = [];
							var values = scope.field.value.split(',');
							var displayValues = scope.field.displayValue.split(',');
							for(var i=0; i<values.length; i++){
								items.push({
									sys_id: values[i],
									name: displayValues[i]
								});
							}
							callback(items);
						}
						else {
							callback({
								sys_id: scope.field.value,
								name: scope.field.displayValue
							});
						}
					} else
						callback([]);
				},
				onSelecting: function(e) {
					var selectedItem = e.choice;
					if ('sys_id' in selectedItem) {
						var values = field.value == '' ? [] : field.value.split(',');
						var displayValues = field.displayValue == '' ? [] : field.displayValue.split(',');

						values.push(selectedItem.sys_id);
						displayValues.push(getDisplayValue(selectedItem));
						//g_form.setValue(field.name, values.join(','), displayValues.join(','));
						scope.field.displayValue = displayValues.join(',');
						scope.field.value = values.join(',');
						scope.$apply();
						e.preventDefault();
						element.select2('val', values).select2('close');
					}
				},
				onRemoving: function(e) {
					var removed = e.choice;
					var values = field.value.split(',');
					var displayValues = field.displayValue.split(',');
					for(var i = values.length-1; i>=0; i--){
						if (removed.sys_id == values[i]) {
							values.splice(i, 1);
							displayValues.splice(i, 1);
							break;
						}
					}
					//g_form.setValue(field.name, values.join(','), displayValues.join(','));
					scope.field.displayValue = displayValues.join(',');
					scope.field.value = values.join(',');
					scope.$apply();
					e.preventDefault();
					element.select2('val', values);
				},
				select2Change: function(e) {
					e.stopImmediatePropagation();
					if (e.added) {
						var selectedItem = e.added;
						var value = selectedItem.sys_id;
						var displayValue = value ? getDisplayValue(selectedItem) : '';
						//g_form.setValue(scope.field.name, value, displayValue);
						scope.field.displayValue = displayValue;
						scope.field.value = value;
						scope.$apply();
					} else if (e.removed) {
						//g_form.clearValue(scope.field.name);
						scope.field.value = '';
						scope.field.displayValue = '';
						scope.$apply();
					}
				}
			};

			var config = {
				width : scope.selectWidth,
				minimumInputLength: scope.minimumInputLength ? parseInt(scope.minimumInputLength, 10) : 0,
				containerCssClass : 'select2-reference ng-form-element',
				placeholder : '   ',
				formatSearching: '',
				allowClear: attrs.allowClear !== 'false',
				id: function(item) {
					return item.sys_id;
				},
				sortResults: (scope.snOptions && scope.snOptions.sortResults) ? scope.snOptions.sortResults : undefined,
				ajax: {
					quietMillis: NOW.ac_wait_time,

					data: function(filterText, page) {
						var filterExpression = filterExpressionParser.parse(filterText, scope.ed.defaultOperator);
						var colToSearch = getReferenceColumnToSearch();
						var refCondition = scope.ed.refCondition;
						var q = colToSearch + filterExpression.operator + filterExpression.filterText +
							'^' + colToSearch + 'ISNOTEMPTY' + getExcludedValues();
						if (refCondition)
							q += "^" + refCondition;
						if (!q.endsWith("^EQ"))
							q += "^EQ";

						var params = {
							start: (scope.pageSize * (page - 1)),
							count: scope.pageSize,
							sysparm_target_table: scope.refTable,
							sysparm_target_sys_id: scope.refId,
							sysparm_target_field: scope.ed.name,
							table: scope.ed.reference,
							qualifier: scope.ed.qualifier,
							data_adapter: scope.ed.data_adapter,
							attributes: scope.ed.attributes,
							dependent_field: scope.ed.dependent_field,
							dependent_table: scope.ed.dependent_table,
							dependent_value: scope.ed.dependent_value,
							p: scope.ed.reference + ';q:' + q + ';r:' + scope.ed.qualifier
						};

						if (scope.domain) {
							params.sysparm_domain = scope.domain;
						}

						if (angular.isDefined(scope.field) && scope.field['_cat_variable'] === true){
							/*delete params['sysparm_target_table'];
							params['sysparm_include_variables'] = true;
							params['variable_ids'] = scope.field.sys_id;
							var getFieldSequence = g_form.$private.options('getFieldSequence');
							if (getFieldSequence) {
								params['variable_sequence1'] = getFieldSequence();
							}
							var itemSysId = g_form.$private.options('itemSysId');
							params['sysparm_id'] = itemSysId;
							var getFieldParams = g_form.$private.options('getFieldParams');
							if (getFieldParams) {
								angular.extend(params, getFieldParams());
							}*/
						}

						if (scope.recordValues)
							params.sysparm_record_values = scope.recordValues();

						return params;
					},

					results: function(data, page) {
						return ctrl.filterResults(data, page, scope.pageSize);
					},

					transport: s2Helpers.search
				},
				formatSelection: s2Helpers.formatSelection,
				formatResult: s2Helpers.formatResult,
				initSelection: s2Helpers.initSelection,
				dropdownCssClass: attrs.dropdownCssClass,
				formatResultCssClass: scope.formatResultCssClass || null,
				multiple: isMultiple
			};

			if (isMultiple && scope.ed.reference == "sys_user") {
				config.createSearchChoice = function (term) {
					if (spIs.an.email(term)) {
						return {
							email: term,
							name: term,
							user_name: term,
							sys_id: term
						};
					}
				};
			}

			if (scope.snOptions) {
				if (scope.snOptions.placeholder) {
					config.placeholder = scope.snOptions.placeholder;
				}
				if (scope.snOptions.width) {
					config.width = scope.snOptions.width;
				}
			}

			function getReferenceColumnToSearch() {
				var colName = 'name';
				if (fieldAttributes['ref_ac_columns_search'] == 'true' && 'ref_ac_columns' in fieldAttributes && fieldAttributes['ref_ac_columns'] != '') {
					var refAcColumns = fieldAttributes['ref_ac_columns'].split(';');
					colName = refAcColumns[0];
				} else if (scope.ed.searchField)
					colName = scope.ed.searchField;
				else if (fieldAttributes['ref_ac_order_by'])
					colName = fieldAttributes['ref_ac_order_by'];

				return colName;
			}

			function getExcludedValues () {
				if (scope.ed.excludeValues && scope.ed.excludeValues != '') {
					//nameISNOTEMPTY^sys_idIN681b365ec0a80164000fb0b05854a0cd,5137153cc611227c000bbd1bd8cd2005
					return '^sys_idNOT IN' + scope.ed.excludeValues;
				}
				return '';
			}

			function parseAttributes(strAttributes) {
				// Turn an attribute string into a simple object
				// "ref_auto_completer=AJAXTableCompleter,ref_contributions=task_show_ci_map;show_related_records,ref_ac_columns=sys_class_name,ref_ac_order_by=sys_class_name"
				// into: {ref_auto_completer: AJAXTableCompleter, ref_contributions: 'task_show_ci_map;show_related_records' ... }

				var attributeArray = (strAttributes && strAttributes.length ? strAttributes.split(',') : []);
				var attributeObj = {};
				for (var i = 0; i < attributeArray.length; i++) {
					if (attributeArray[i].length > 0) {
						var attribute = attributeArray[i].split('=');
						attributeObj[attribute[0]] = attribute.length > 1 ? attribute[1] : '';
					}
				}
				return attributeObj;
			}

			function init() {
				$timeout(function() {
					i18n.getMessage('Searching...', function(searchingMsg) {
						config.formatSearching = function() {
							return searchingMsg;
						};
					});
					element.css("opacity", 1);
					element.select2("destroy");
					var select2 = element.select2(config);
					element.select2("val", scope.field.value.split(','));
					if (isMultiple){
						element.bind("select2-selecting", s2Helpers.onSelecting);
						element.bind("select2-removing", s2Helpers.onRemoving);
					} else {
						element.bind("change select2-removed", s2Helpers.select2Change);
					}
					element.bind("select2-blur", function() {
						scope.$apply(function() {
							scope.snOnBlur();
						});
					});

					if (fireReadyEvent) {
						scope.$emit('select2.ready', element);
						fireReadyEvent = false;
					}
				});
			}



			function getDisplayValue(selectedItem) {
				var displayValue = '';
				if (selectedItem && selectedItem.sys_id) {
					if (scope.displayColumn && typeof selectedItem[scope.displayColumn] != "undefined")
						displayValue = selectedItem[scope.displayColumn];
					else if (selectedItem.$$displayValue)
						displayValue = selectedItem.$$displayValue;
					else if (selectedItem.name)
						displayValue = selectedItem.name;
					else if (selectedItem.title)
						displayValue = selectedItem.title;
				}
				return displayValue;
			}

			function getDisplayValues(selectedItem) {
				var displayValues = [];
				if (selectedItem && selectedItem.sys_id) {
					displayValues.push(getDisplayValue(selectedItem));
				}

				if (displayColumns) {
					var columns = displayColumns.split(";");
					for (var i = 0; i < columns.length; i++) {
						var column = columns[i];
						if (selectedItem[column])
							displayValues.push(selectedItem[column]);
					}
				}
				return displayValues;
			}

			/*g_form.$private.events.on("change", function(fieldName, oldValue, value) {
				if (fieldName == field.name) {
					element.select2("val", typeof value == 'string' ? value.split(',') : value);
				}
			});*/

			scope.$on("snReferencePicker.activate", function(evt, parms) {
				$timeout(function() {
					element.select2("open");
				})
			});

			init();
		},

		controller: function($scope, $rootScope) {
			$scope.pageSize = 20;

			// Default Results Filter (aka, None)
			this.filterResults = function(data, page) {
				return {
					results: data.data.items,
					more: (page * $scope.pageSize < data.data.total)
				};
			};
		}
	};
}
