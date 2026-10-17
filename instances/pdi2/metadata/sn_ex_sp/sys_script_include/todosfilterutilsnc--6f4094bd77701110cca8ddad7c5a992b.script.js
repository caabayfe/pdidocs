var TodosFilterUtilSNC = Class.create();
TodosFilterUtilSNC.prototype = {
    initialize: function() {},

    _getTodoFilterIds: function(tableName, columnName) {
        var filterSysIds = [];
        var mappingGr = new GlideAggregate(tableName);
        mappingGr.groupBy(columnName);
        mappingGr.query();
        while (mappingGr.next()) {
            filterSysIds.push(mappingGr[columnName].toString());
        }
        return filterSysIds;
    },

    _getGroupFilterIds: function(isGroupValue) {
        var filterSysIds = [];
        var filterGr = new GlideRecord('sn_hr_sp_todo_filter');
        filterGr.addQuery('is_filter_group', isGroupValue);
        filterGr.query();
        while (filterGr.next()) {
            if (filterGr.canRead()) {
                filterSysIds.push(filterGr.getUniqueValue());
            }
        }
        return filterSysIds;
    },

    isSubfilter: function(sysId) {
        var childFilterSysIds = this._getTodoFilterIds('sn_hr_sp_todo_filter_m2m_filter', 'todo_child_filter');
        return childFilterSysIds.some(function(id) {
            return id == sysId;
        });
    },

    _filterRecords: function(sysIds) {
        var filterGr = new GlideRecord('sn_hr_sp_todo_filter');
        filterGr.addQuery('sys_id', 'NOT IN', sysIds);
        filterGr.addActiveQuery();
        filterGr.query();
        var filterSysIds = [];
        while (filterGr.next())
            if (filterGr.canRead()) {
                filterSysIds.push(filterGr.getUniqueValue());
            }
        return 'sys_idIN' + filterSysIds.join(',');
    },

    filterMappingExists: function(category) {
        var gr = new GlideRecord('sn_hr_sp_todo_filter_m2m_category');
        gr.addQuery('category', category);
        gr.setLimit(1);
        gr.query();
        if (gr.hasNext())
            return true;
        return false;
    },

    /** A parent filter is a filter which is not a:
     * 1. Child filter in any filter
     * 2. Standlone filter(ie. is not a group filter and associated with a category)
     **/
    getParentFiltersMappingIds: function(current) {
        var childFilterSysIds = this._getTodoFilterIds('sn_hr_sp_todo_filter_m2m_filter', 'todo_child_filter');
        var standaloneFilterSysIds = this._getGroupFilterIds(false);
        var filterSysIds = childFilterSysIds.concat(standaloneFilterSysIds);
        if (current.todo_child_filter) {
            var filterId = current.todo_child_filter.toString();
            filterSysIds.push(current.todo_child_filter.toString());
        }
        return this._filterRecords(filterSysIds);

    },
    /** A child filter is a filter which is not a:
     * 1. Parent filter
     * 2. Child filter in any filter
     * 3. Standlone filter(ie. is not a group filter and associated with a category)
     **/
    getChildFiltersMappingIds: function(current) {
        var parentFilterSysIds = this._getTodoFilterIds('sn_hr_sp_todo_filter_m2m_filter', 'todo_parent_filter');
        var childFilterSysIds = this._getTodoFilterIds('sn_hr_sp_todo_filter_m2m_filter', 'todo_child_filter');
        var categoryMappingFilterSysIds = this._getTodoFilterIds('sn_hr_sp_todo_filter_m2m_category', 'filter');
        var standaloneFilterSysIds = this._getGroupFilterIds(true);
        var filterSysIds = parentFilterSysIds.concat(childFilterSysIds, standaloneFilterSysIds, categoryMappingFilterSysIds);
        if (current.todo_parent_filter) {
            var filterId = current.todo_parent_filter.toString();
            filterSysIds.push(filterId);
        }
        return this._filterRecords(filterSysIds);
    },

    _getFilterIdIfExists: function(sys_id) {
        var mappingGr = new GlideRecord('sn_hr_sp_todo_filter_m2m_category');
        if (mappingGr.get(sys_id) && mappingGr.canRead()) {
            return mappingGr.filter.toString();
        }
        return '';

    },

    getParentFilterIds: function() {
        var childFilterSysIds = this._getTodoFilterIds('sn_hr_sp_todo_filter_m2m_filter', 'todo_child_filter');
        var filterSysIds = childFilterSysIds.concat(this._getTodoFilterIds('sn_hr_sp_todo_filter_m2m_category', 'filter'));
        var filterId = this._getFilterIdIfExists(current.sys_id);
        if (filterId) {
            var index = filterSysIds.indexOf(filterId);
            if (index > -1) {
                filterSysIds.splice(index, 1);
            }
        }
        return this._filterRecords(filterSysIds);
    },

    getCategoriesForMapping: function(filter) {
        var categorySysIds = [];
        var categoryGr = new GlideRecord('sn_hr_sp_todo_filter_category');
        categoryGr.addActiveQuery();
        categoryGr.query();
        while (categoryGr.next())
            if (categoryGr.canRead()) {
                categorySysIds.push(categoryGr.getUniqueValue());
            }
        return 'sys_idIN' + categorySysIds.join(',');
    },

    alreadyAddedToCategory: function(filter) {
        var mappingGr = new GlideRecord('sn_hr_sp_todo_filter_m2m_category');
        mappingGr.addQuery('filter', filter);
        mappingGr.query();
        if (mappingGr.hasNext())
            return true;
        return false;
    },

    alreadyAddedToFilterGroup: function(filter) {
        var mappingGr = new GlideRecord('sn_hr_sp_todo_filter_m2m_filter');
        mappingGr.addQuery('todo_child_filter', filter);
        mappingGr.query();
        if (mappingGr.hasNext())
            return true;
        return false;
    },


    isChildFilter: function(filter) {
        var gr = new GlideRecord('sn_hr_sp_todo_filter_m2m_filter');
        gr.addQuery('todo_child_filter', filter);
        gr.setLimit(1);
        gr.query();
        if (gr.hasNext())
            return true;
        return false;
    },

    categoryWithSameNameExists: function(categoryRecord) {
        var categoryGr = new GlideRecord('sn_hr_sp_todo_filter_category');
        categoryGr.addQuery('name', categoryRecord.name);
        categoryGr.addQuery('sys_id', '!=', categoryRecord.getUniqueValue());
        categoryGr.query();
        if (categoryGr.hasNext())
            return true;
        return false;
    },

    getFilters: function(approvalsOnly) {
        var filtersData = [];
        var categories = this._getCategories();

        while (categories.next()) {
            var category = {
                filters: []
            };
            category.title = categories.getDisplayValue('name');
            category.categoryId = categories.getUniqueValue();
            category.displayOnUI = categories.getValue('display') == 1;
            category.filters = this._getFiltersFromCategory(category.categoryId, approvalsOnly);
            // Only include categories that have at least one filter with active conditions
            if (category.filters.length == 0) {
                continue;
            }
            category.selectedFilters = [];
            filtersData.push(category);
        }
        return filtersData;
    },

    _getCategories: function() {
        var categoriesGr = new GlideRecord('sn_hr_sp_todo_filter_category');
        categoriesGr.addActiveQuery();
        categoriesGr.orderBy('order');
        categoriesGr.orderBy('name');
        categoriesGr.query();
        return categoriesGr;
    },

    _updateActiveConfigConditionsList: function(activeConfigConditionsGr, activeConfigConditionsList) {
        while (activeConfigConditionsGr.next()) {
            if (activeConfigConditionsGr.canRead()) {
                var activeConfigCondition = {};
                activeConfigCondition.filterId = activeConfigConditionsGr.todos_filter_condition.getDisplayValue();
                activeConfigCondition.filterCondition = this._fetchTodoFilterCondition(activeConfigConditionsGr);
                var activeConfigConditionsListRec = {
                    configConfition: activeConfigConditionsGr.todos_filter_condition.todo_config.condition.toString(),
                    activeConfigFilterConditions: activeConfigCondition
                };

                if (activeConfigConditionsList[activeConfigConditionsGr.todos_filter_condition.todo_config]) {
                    activeConfigConditionsList[activeConfigConditionsGr.todos_filter_condition.todo_config].push(activeConfigConditionsListRec);
                } else {
                    activeConfigConditionsList[activeConfigConditionsGr.todos_filter_condition.todo_config] = [activeConfigConditionsListRec];
                }
            }
        }
    },

    _isFilterAvailable: function(filter) {
        if (filter.is_filter_group) {
            return true;
        }
        var access = false;
        var user = gs.getUserID();
        var availableFor = !filter.available_for ? false : sn_uc.UserCriteriaLoader.userMatches(user, filter.available_for.split(','));
        var notAvailableFor = !filter.not_available_for ? false : sn_uc.UserCriteriaLoader.userMatches(user, filter.not_available_for.split(','));
        if (!notAvailableFor && availableFor) {
            access = true;
        }
        return access;
    },

    _getFiltersFromCategory: function(categoryId, approvalsOnly) {
        var filterSources = new GlideRecord('sn_hr_sp_todo_filter_m2m_category');
        filterSources.addActiveQuery();
        filterSources.orderBy('order');
        filterSources.orderBy('filter.name');
        filterSources.addQuery('category', categoryId);
        filterSources.query();
        var filters = [];
        while (filterSources.next()) {
            var filterRec = filterSources.filter;
            if (filterRec && filterRec.active && this._isFilterAvailable(filterRec)) {
                var filter = {
                    filterName: filterRec.getDisplayValue('name'),
                    filterId: filterRec.toString(),
                    isGroup: Boolean(filterRec.is_filter_group),
                };

                if (filter.isGroup) {
                    filter.subFilters = this._getSubFilters(filterRec, approvalsOnly);
                    if (filter.subFilters.length == 0) {
                        continue;
                    }
                } else {
                    var activeConfigConditionsList = {};
                    var activeConfigConditionsGr = this._getActiveFilterConditions(filterRec, approvalsOnly);
                    if (!activeConfigConditionsGr.hasNext()) {
                        continue;
                    } else {
                        this._updateActiveConfigConditionsList(activeConfigConditionsGr, activeConfigConditionsList);

                        filter.configConditions = activeConfigConditionsList;
                    }
                }

                filters.push(filter);
            }
        }
        return filters;
    },

    _getSubFilters: function(parentFilter, approvalsOnly) {
        var childFiltersGr = new GlideRecord('sn_hr_sp_todo_filter_m2m_filter');
        childFiltersGr.addQuery('todo_parent_filter', parentFilter);
        childFiltersGr.orderBy('order');
        childFiltersGr.orderBy('todo_child_filter.name');
        childFiltersGr.query();
        var subFilters = [];
        while (childFiltersGr.next()) {
            if (childFiltersGr.canRead()) {
                var childFilterRec = childFiltersGr.todo_child_filter;
                if (childFilterRec && childFilterRec.active && this._isFilterAvailable(childFilterRec)) {

                    var activeConfigConditionsList = {};
                    var activeConfigConditionsGr = this._getActiveFilterConditions(childFilterRec, approvalsOnly);
                    if (!activeConfigConditionsGr.hasNext()) {
                        continue;
                    } else {
                        this._updateActiveConfigConditionsList(activeConfigConditionsGr, activeConfigConditionsList);
                    }

                    var filter = {
                        filterName: childFilterRec.getDisplayValue('name'),
                        filterId: childFilterRec.toString(),
                        isGroup: Boolean(childFilterRec.is_filter_group),
                        configConditions: activeConfigConditionsList
                    };
                    subFilters.push(filter);
                }
            }
        }
        return subFilters;
    },

    _fetchTodoFilterCondition: function(todoFilterConditionMappingGr, params) {
        var currentTodoFilterCondition = todoFilterConditionMappingGr.todos_filter_condition.condition.toString();
        if (todoFilterConditionMappingGr.todos_filter_condition.add_additional_condition.toString() === 'true') {
            var evaluator = new GlideScopedEvaluator();
            evaluator.putVariable('params', params);
            var result = evaluator.evaluateScript(todoFilterConditionMappingGr.todos_filter_condition.getRefRecord(), 'additional_condition');
            return result ? currentTodoFilterCondition + "^" + result : currentTodoFilterCondition;
        }

        return currentTodoFilterCondition;
    },

    _getActiveFilterConditions: function(filter, approvalsOnly) {
        var filterConditionGr = new GlideRecord('sn_hr_sp_todo_filter_m2m_condition');
        filterConditionGr.addQuery("todo_filter", filter);
        filterConditionGr.addQuery("todos_filter_condition.active", true);
        filterConditionGr.addQuery("todos_filter_condition.todo_config.active", true);

        // Filter for approvals only if parameter is set to true
        if (approvalsOnly === true) {
            filterConditionGr.addQuery("todos_filter_condition.todo_config.table", "sysapproval_approver");
        }

        filterConditionGr.query();
        return filterConditionGr;
    },

    type: 'TodosFilterUtilSNC'
};
