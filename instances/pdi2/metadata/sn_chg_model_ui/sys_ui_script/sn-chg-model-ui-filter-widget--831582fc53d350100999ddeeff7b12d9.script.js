/**
 * NG Filter Widget
 *
 * Confused? Check the NG Filter Widget Documentation UI page!
 *
 *
 * filterConfig options:
 *
 * encodedQuery           (string)  The encoded query to update and start from. Updated when "snfilter:update_query" is emitted.
 * queryObj               (object)  The object containing the parts of the filter, updated and loaded just like encodedQuery. Updated when "snfilter:update_query" is emitted.
 * sets                   (bool)    Show or hide sets
 * dotWalking             (bool)    Can a user dot walk through the field picker.
 * saveFilter             (bool)    Show the save filter button.
 * testFilter             (bool)    Shows the record count as you change the filter.
 * loadFilter             (bool)    Show the load filter button.
 * sortFilter             (bool)    Enable or disable sort modal
 * runFilter              (bool)    Show the run button. If disabled use mode="automatic".
 * clearFilter            (bool)    Show the clear all button.
 * closeFilter            (bool)    Show the close filter button.
 * watchConfig            (bool)    Live updates on config object passed into filter
 * outputType             (string)  What type of query filter widget emits when run. Options are "encoded_query" and "glide_query". Defaults to "glide_query"
 * fieldList              (array)   List of fields to show in the filter
 *
 */
angular.module("sn.filter_widget")
.directive("chgModelFilterWidget", function($window, urlTools, snCustomEvent, snFilterInstanceStore, i18n) {
	"use strict";

	return {
		restrict: "E",
		replace: true,
		templateUrl: urlTools.getPartialURL("sn_chg_model_ui_landing_cmu_filter_widget", "v=" + $window.NOW.macro_flush_stamp),
		scope: {
			table: "@",
			tableLabel: "@",
			filterConfig: "=",
			uid: "=?"
		},
		controller: function($scope, $element, $attrs) {
			var GLIDE_QUERY = "glide_query";
			var ENCODED_QUERY = "encoded_query";
			var filterId;
			var filterInstance;
			var internalChange = false;
			var uid = angular.isDefined($scope.uid) ? $scope.uid : $scope.table;
			var defaults = {
				sets: true,
				watchConfig: false,
				dotWalking: true,
				saveFilter: false,
				loadFilter: false,
				testFilter: false,
				sortFilter: true,
				runFilter: true,
				closeFilter: true,
				clearFilter: true,
				outputType: GLIDE_QUERY,
				relatedListQueryConditions: false,
				manageFiltersLink: "/sys_filter_list.do",
				uid: uid,
				fieldList : []
			};

			$scope.fieldListCloseEvent = "filter-field-list-close";
			$scope.$on("$destroy", cleanUp);

			$scope.messages = {
				"Add Sort" : i18n.getMessage("Add Sort")
			};

			/**
			 * Kick off this directive
			 */
			activate();

			function activate() {
				_extendConfig();
				_bindFilterConfigWatcher();
				filterId = snFilterInstanceStore.create($scope.table, $scope.filterConfig.relatedListQueryConditions, undefined, $scope.filterConfig.fieldList);
				filterInstance = snFilterInstanceStore.get(filterId);
				_bindTooltips();
				$scope.uid = $scope.filterConfig.uid;
				var query = _getQueryType();
				_initializeQuery(query, false).then(function() {
					//performance tester hook
					snCustomEvent.fireAll("snfilter:activated");
				});
			}

			/**
			 * Updates the base table. This will reset all the filter field lists
			 */
			$scope.$on("snfilter:update_table", function(e, data) {
				if ((data.id && $scope.widgetId && (data.id == $scope.widgetId)) || !$scope.widgetId) {
				filterInstance.updateTable(data.table);
				$scope.$broadcast("snfilter:update_predicate_base_table", data);
				}
			});

			/**
			 * Update the internal query. Can be encoded_query string or GlideQuery object
			 */
			$scope.$on("snfilter:initialize_query", function(e, query) {
				_initializeQuery(query, false);
			});

			snCustomEvent.on("snfilter:initialize_query", initializeQuery);

			function initializeQuery(e, query) {
				_initializeQuery(typeof e.predicates !== "undefined" ? e : query, false);
			}

			/**
			 * Update the sort in the internal query.
			 */
			$scope.$on("snfilter:update_order_by", function(e, sortArray) {
				if (!sortArray)
					return;
				filterInstance.setSort(sortArray);
				_updateFilter();
				_emitQuery();
			});

			/**
			 * Internal event that triggers the encoded_query string update based on if there are valid comparisons.
			 */
			snCustomEvent.observe("snfilter:conditionChange", conditionChange);

			function conditionChange() {
				_updateFilter();
				if (_isAutomatic())
					_emitQuery();
			}

			/**
			 * general functions
			 */
			$scope.runFilter = runFilter;
			$scope.testFilter = testFilter;
			$scope.clearFilter = clearFilter;
			$scope.close = close;
			$scope.addComparisonRow = addComparisonRow;
			$scope.removeComparisonRow = removeComparisonRow;
			$scope.addCompound = addCompound;

			/**
			 * Add a Comparison Row based on index with a "type"
			 * @param setIndex {Integer}
			 * @param ruleSetIndex {Integer}
			 * @param condIndex {Integer}
			 * @param type {String}
			 */
			function addComparisonRow(setIndex, ruleSetIndex, condIndex, type) {
				$scope.$evalAsync(function() {
					filterInstance.addComparisonRow(setIndex, ruleSetIndex, condIndex, type);
				});
			}

			/**
			 * Remove a Comparison row based on index
			 * @param setIndex {Integer}
			 * @param ruleSetIndex {Integer}
			 * @param conditionIndex {Integer}
			 */
			function removeComparisonRow(setIndex, ruleSetIndex, conditionIndex) {
				$scope.$broadcast($scope.fieldListCloseEvent);
				$scope.$evalAsync(function() {
					filterInstance.removeComparisonRow(setIndex, ruleSetIndex, conditionIndex);

					if (_isAutomatic())
						runFilter();
				});
			}

			/**
			 * Add a new filter compound
			 */
			function addCompound() {
				filterInstance.addCompound();
			}

			/**
			 * Clear All Filter Conditions
			 */
			function clearFilter() {
				$scope.filterConfig.relatedShowCompounds = false;
				$scope.$broadcast("snfilter:reset_related_list_select");

				_initializeQuery("", true);

				// List specific to empty the column header search values
				snCustomEvent.fire("filter:table.clear_column_headers", $scope.table);
			}

			/**
			 * Close filter widget (triggered from (x) close button
			 */
			function close() {
				$scope.$emit("snbreadcrumbs:toggle_filter");
				angular.element("#"+$scope.uid+"-open-filters-button").focus();
			}

			/**
			 *
			 */
			function testFilter() {
				filterInstance.testResult().then(function(count) {
					$scope.count = count;
				});
			}

			/**
			 * Based on the filter type, get the query and emit it
			 * Note that the query is NOT constructed here, its already been constructed
			 *
			 */
			function runFilter() {
				try {
					_updateFilter();
					_emitQuery();
				} catch (ex) {
					_errorHandler(ex);
				}
			}

			/**
			 * Remove FilterInstance from FilterInstanceStore
			 */
			function cleanUp() {
				$element.tooltip("destroy");
				//snFilterInstanceStore.remove($scope.table);
				snFilterInstanceStore.remove(filterId);
				snCustomEvent.un("snfilter:conditionChange", conditionChange);
				snCustomEvent.un("snfilter:initialize_query", initializeQuery);
			}

			/**
			 * extend our local config options with the filterConfig object thats passed in
			 */
			function _extendConfig() {
				$scope.filterConfig = angular.extend({}, defaults, $scope.filterConfig);
				if ($attrs.relatedListQueryConditions === "true")
					angular.extend($scope.filterConfig, {relatedListQueryConditions: true});

				$scope.filterConfig.hideHeader = _checkHideHeader($scope.filterConfig);
			}

			/**
			 * If configured to watch the filterConfig, set up a watcher
			 * @private
			 */
			function _bindFilterConfigWatcher() {
				if ($scope.filterConfig.watchConfig) {
					$scope.$watch("filterConfig", function(n, o) {
						if (n !== o && !internalChange)
							_extendConfig();

						internalChange = false;
					}, true);
				}
			}

			/**
			 * bind our tooltips
			 * @private
			 */
			function _bindTooltips() {
				$element.tooltip({
					selector: ".sn-filter-tooltip"
				}).on("hide.bs.tooltip", function(evt) {
					var button = jQuery(evt.target);
					if (typeof button.hideFix === "function") {
						button.hideFix();
					}
				});
			}

			/**
			 * Determine if we should emit our query on every change
			 * @returns {boolean}
			 * @private
			 */
			function _isAutomatic() {
				return ($scope.filterConfig.runFilter === false);
			}

			/**
			 * Hide the filter widget header if theres no reason to show it
			 * @param config {object}
			 * @returns {boolean}
			 * @private
			 */
			function _checkHideHeader(config) {
				return (config.saveFilter === false &&
				config.loadFilter === false &&
				config.testFilter === false &&
				config.sortFilter === false &&
				config.runFilter === false &&
				config.closeFilter === false );
			}

			/**
			 * Update the filterConfig with our most up to date encoded_query and GlideQuery object
			 * @private
			 */
			function _updateFilter() {
				if ($scope.filterConfig.watchConfig)
					internalChange = true;

				$scope.filterConfig.queryObj = filterInstance.buildQueryObject();
				$scope.filterConfig.encodedQuery = $scope.filterConfig.queryObj.toQueryString();
				$scope.$emit("snfilter:filter_change");
			}

			/**
			 * Emit our query based on the filterConfig outputType
			 * @private
			 */
			function _emitQuery() {
				switch ($scope.filterConfig.outputType) {
					case ENCODED_QUERY :
						$scope.$emit("snfilter:update_query", $scope.filterConfig.encodedQuery, $scope.table);
						break;
					case GLIDE_QUERY :
						$scope.$emit("snfilter:update_query", $scope.filterConfig.queryObj, $scope.table);
						break;
					default :
						$scope.$emit("snfilter:update_query", $scope.filterConfig.queryObj, $scope.table);
				}
			}

			/**
			 * Get the correct kind of query
			 *
			 */
			function _getQueryType() {
				var query = [];
				if ($scope.filterConfig.queryObj)
					query = $scope.filterConfig.queryObj;
				else if ($scope.filterConfig.encodedQuery)
					query = $scope.filterConfig.encodedQuery;

				return query;
			}

			/**
			 * Initialize our filterInstance with a new query
			 * @param query {GlideQuery|String}
			 * @param update {Boolean}Emit updated query to the world
			 * @returns {*}
			 * @private
			 */
			function _initializeQuery(query, update) {

				$scope.initializing = true;

				return filterInstance.initialize(query, $scope.table, $scope.filterConfig.extendedOperatorOptions).then(function(queryMap){

					$scope.initializing = false;
					$scope.queryMap = queryMap;
					$scope.sortItems = filterInstance.getSort();

					if (update) {
						_updateFilter();
						_emitQuery();
					}
				});
			}

			function _errorHandler(ex) {
				console.warn(ex);
			}

			$scope.$watch("sortItems", function(sortArray, oldValue) {
				$scope.$emit("snfilter:update_order_by", sortArray);
			}, true);
		}
	};
})
.directive("chgModelSortFilterWidget", function($window, urlTools, snDotWalkTableAPI, i18n, snFilterUtilities, snDotWalkUtilities, snFilterInstanceErrors) {
	"use strict";
	return {
		restrict: "E",
		replace: true,
		templateUrl: urlTools.getPartialURL("sn_chg_model_ui_landing_cmu_sort_filter_widget.xml", "v=" + $window.NOW.macro_flush_stamp),
		controller : function($scope) {

			var firstField;
			$scope.showSort = false;
			$scope.sortDirections = [
				{
					label: i18n.getMessage("A to Z"),
					value: true
				},
				{
					label: i18n.getMessage("Z to A"),
					value: false
				}
			];

			$scope.addSortItem = addSortItem;
			$scope.removeSortItem = removeSortItem;
			$scope.setSort = setSort;

			$scope.toggleSort = function() {
				$scope.showSort = !$scope.showSort;
				if ($scope.showSort)
					_checkEmptySortItems();
				if (!$scope.sortFields)
					activate();
			};

			function isEmptySort() {
				return (!Array.isArray($scope.sortItems) || !$scope.sortItems[0] || !$scope.sortItems[0].hasOwnProperty("column_label"));
			}

			$scope.showSortSection = function() {
				return $scope.showSort || !isEmptySort();
			};

			activate();

			function activate() {
				_getFilterFieldsData()
					.catch(function() {
						throw new snFilterInstanceErrors.SortFilterMetadataError($scope.table);
					})
					.finally(_checkEmptySortItems);
			}

			function setSort() {
				$scope.$emit("snfilter:update_order_by", $scope.sortItems);
			}

			function _getFilterFieldsData() {
				return snDotWalkTableAPI.getMetaData($scope.table, false, false).then(function(columns) {
					if ($scope.fieldList && $scope.fieldList.length > 0)
						columns = filterTableColumns(columns, $scope.fieldList);
					var _filterFields = snFilterUtilities.convertObjectToArray(columns).filter(_removeEdgeEncryptionFields);
					$scope.sortFields = snDotWalkUtilities.makeFieldsArray(_filterFields);
				});
			}

			function _checkEmptySortItems() {
				if ($scope.sortItems.length === 0)
					addSortItem();
			}

			function addSortItem() {
				$scope.sortItems.push({
					column_name: firstField,
					ascending : true
				});
			}

			function removeSortItem(index) {
				$scope.sortItems.splice(index, 1);
				if ($scope.sortItems.length === 0) {
					$scope.showSort = false;
					setSort();
				}
			}

			function _removeEdgeEncryptionFields(item) {
				return (["fixed"].indexOf(item.edge_encryption_type) === -1);
			}

			function filterTableColumns(columns, filterColumns) {
				var processedColumns = {};
				angular.forEach(filterColumns, function(column) {
					if (columns[column])
						processedColumns[column] = columns[column];

				});
				if (columns["123TEXTQUERY321"])
					processedColumns["123TEXTQUERY321"] = columns["123TEXTQUERY321"];
				return processedColumns;
			}
		},
		link: function(scope, elem, attrs) {
			attrs.$observe("fieldList", function(value) {
				scope.fieldList = (value) ? value.split(","): [];
			});
		}
	};
});
