var todoPageUtils = Class.create();
todoPageUtils.TABLE_TODOS_CONFIG = "sn_hr_sp_todos_config";
todoPageUtils.TABLE_TODOS_WIDGET_MAPPING = "sn_hr_sp_todos_widget_mapping";
todoPageUtils.FIELD_TODOS_STATE = "state";
todoPageUtils.TODO_PAGE_ID = "hrm_todo";
todoPageUtils.OPEN_TAB = "open";
todoPageUtils.COMPLETED_TAB = "completed";
todoPageUtils.TABLE_SC_REQUEST_ITEM = "sc_req_item";
todoPageUtils.ALL_TODO_PAGE_ID = "hrm_todos_page";
todoPageUtils.QUERY_LIMIT = 10; // numbers of todo records needs to be fetched.
todoPageUtils.LIMIT_TOTAL_TODOS = 300; // Limit of the total number of to-dos for the sum of all tabs
todoPageUtils.LIMIT_TODOS_FETCH = 10;
todoPageUtils.EMPLOYEE_CENTER_CORE_CACHE = 'employee_center_core_cache';

todoPageUtils.prototype = {
    initialize: function() {
        this._pluginManager = new GlidePluginManager();
        this._hrCoreActive = this._pluginManager.isActive('com.sn_hr_core');
        this._journeyActive = this._pluginManager.isActive('com.sn_jny');
        this._hrLEActive = this._pluginManager.isActive('com.sn_hr_lifecycle_events');
        this._egdCoreActive = this._pluginManager.isActive('com.sn_egd_core');
        this._opmActive = this._pluginManager.isActive('com.sn_opp_market');
        this._delegationActive = this._pluginManager.isActive('com.glide.granular_service_delegation');
    },

    /*
     * To add delegation filter to glide encodedQuery
     * @input: conditions as string (i.e. assigned_toDynamic...^...)
     * @output: string
     */
    _addDelegationTaskFilter: function(conditions) {
        if (!this._delegationActive)
            return conditions;

        var delegatedConditions = conditions.split('^');

        for (var i = 0; i < delegatedConditions.length; i++)
            if (/assigned_toDYNAMIC/.test(delegatedConditions[i]))
                delegatedConditions[i] += '^ORsys_id=javascript:new sn_hr_sp.hr_sp_Delegation().getDelegatedTasks()';
            else if (/javascript:sn_hr_sp\.hr_getMyApprovals\(\)/.test(delegatedConditions[i]) || /approverDYNAMIC/.test(delegatedConditions[i]))
            delegatedConditions[i] += '^ORsys_id=javascript:new sn_hr_sp.hr_sp_Delegation().getDelegatedApprovals()';

        return delegatedConditions.join("^");
    },

    /*
     * Add LE ad hoc task filter to glide encodedQuery
     * @input: conditions as string (i.e. assigned_toDynamic...^...)
     * @output: string
     */
    _addLEAdHocTaskFilter: function(conditions) {
        if (!this._hrLEActive)
            return conditions;

        return conditions + '^RLQUERYsn_hr_le_activity_status.related_record,<1^activity_set_context.state=awaiting_trigger^activityISEMPTY^ENDRLQUERY';
    },

    /*
     * Add Journey Plan Configuration Approval tasks to glide encodedQuery
     * @input: conditions as string (i.e. assigned_toDynamic...^...)
     * @output: string
     */
    _addJourneyApprovalFilter: function(conditions) {
        if (!this._journeyActive)
            return conditions;
        var approvalIndicator = 'sysapprovalISNOTEMPTY';
        return conditions.replaceAll(approvalIndicator, approvalIndicator + '^ORsource_table=sn_ja_plan_config_aux');
    },

    /*
     * Add Opportunity Approval tasks to glide encodedQuery
     * @input: conditions as string (i.e. assigned_toDynamic...^...)
     * @output: string
     */
    _addOpportunityApprovalFilter: function(conditions) {
        if (!this._opmActive)
            return conditions;
        var approvalIndicator = 'sysapprovalISNOTEMPTY';
        return conditions.replaceAll(approvalIndicator, approvalIndicator + '^ORsource_table=sn_opp_market_opportunity');
    },

    /*
     * Add additional filters to glide encodedQuery
     * @input: conditions as string (i.e. assigned_toDynamic...^...)
     * @output: string
     */
    _addTaskFilters: function(conditions, isRecordWatcher) {
        var queryTerminator = '^EQ';

        if (conditions.length > 2 && conditions.substring(conditions.length - 3) === queryTerminator)
            conditions = conditions.substring(0, conditions.length - 3);
        else
            queryTerminator = '';

        conditions = this._addDelegationTaskFilter(conditions);

        conditions = this._addJourneyApprovalFilter(conditions);
        conditions = this._addOpportunityApprovalFilter(conditions);
        //adhoc task conditions not needed for recordwatchers
        if (!isRecordWatcher)
            conditions = this._addLEAdHocTaskFilter(conditions);

        return conditions + queryTerminator;
    },

    /*
     * To check if todo configuration has widget mappings
     * return false if has widget mappings
     * @input : todo configuration sysid
     * @output : Boolean
     */
    canEditTableColumn: function(todoConfigSysId) {
        var todoWidgetMappingGr = new GlideRecord(todoPageUtils.TABLE_TODOS_WIDGET_MAPPING);
        todoWidgetMappingGr.addQuery("to_dos_configuration", todoConfigSysId);
        todoWidgetMappingGr.setLimit(1);
        todoWidgetMappingGr.query();
        return !todoWidgetMappingGr.hasNext();
    },

    //Get the approval config record
    getApprovalConfiguration: function() {
        var onlyDelegatedApprExists = false;
        var apprDelegationAPI = new global.ApprovalDelegationUtil();
        if ('getOnlyDelegatedApprovals' in apprDelegationAPI) {
            onlyDelegatedApprExists = true;
        }
        var toDoConfigGr = new GlideRecord(todoPageUtils.TABLE_TODOS_CONFIG);
        toDoConfigGr.addQuery('table', 'sysapproval_approver');
        toDoConfigGr.addQuery('condition', 'CONTAINS', 'sysapprovalISNOTEMPTY');
        if (onlyDelegatedApprExists) {
            toDoConfigGr.addQuery('condition', 'CONTAINS', 'sys_id=javascript:new global.ApprovalDelegationUtil().getOnlyDelegatedApprovals()');
        } else {
            toDoConfigGr.addQuery('condition', 'CONTAINS', 'sys_id=javascript:new global.ApprovalDelegationUtil().getMyAndDelegatedApprovals()');
        }
        toDoConfigGr.addQuery('condition', 'CONTAINS', 'approver=javascript:new global.ApprovalDelegationUtil().getApprovers()');
        toDoConfigGr.addQuery('condition', 'CONTAINS', 'state=requested');
        toDoConfigGr.setLimit(1);
        toDoConfigGr.query();
        if (toDoConfigGr.next())
            return toDoConfigGr;
        return "";
    },

    //Get the acceptance config record

    getAcceptanceConfiguration: function(tablename) {
        //check the conditions on the table or its hierarchy
        var acceptanceJSON = {};
        var parentTablesObj = new GlideTableHierarchy(tablename);
        var hierarchyParentTableList = parentTablesObj.getHierarchy();
        var listSize = hierarchyParentTableList.length;
        for (var i = 0; i < listSize; i++) {
            var grToDoConfig = new GlideRecord(todoPageUtils.TABLE_TODOS_CONFIG);
            grToDoConfig.addQuery('condition', 'CONTAINS', 'state=20');
            grToDoConfig.addQuery('table', hierarchyParentTableList[i]);
            grToDoConfig.setLimit(1);
            grToDoConfig.query();
            if (grToDoConfig.next())
                return grToDoConfig;
        }

        return "";
    },

    // get Todo Configuration display values
    getTodoConfigDisplayValue: function(todoSysId, todoConfigGr) {
        var todoRecordData = {};
        var queryStatus = {};
        var todoRecord = {};
        todoRecord = this._getConfigurationList(todoConfigGr);
        var queryInstanceGr = new GlideRecord(todoRecord.table);
        if ((!gs.nil(todoRecord) && !gs.nil(todoRecord.table))) {
            queryStatus = {
                queryGr: queryInstanceGr,
                displayRowDetailsJson: todoRecord.displayRowDetailsJson,
                todoConfigurationSysId: todoRecord.todoConfigurationSysId,
                widgetMappings: todoRecord.widgetMappings
            };
            if (queryInstanceGr.get(todoSysId))
                todoRecordData = this._getRecordInfo(queryInstanceGr, queryStatus);
        }
        return todoRecordData;
    },


    _getConfigurationList: function(todoConfigGr) {
        var todoConfigRecord = {};
        todoConfigRecord.table = todoConfigGr.table.toString();
        todoConfigRecord.condition = todoConfigGr.condition.toString();
        todoConfigRecord.displayRowDetailsJson = this._getDisplayRowDetails(todoConfigGr);
        todoConfigRecord.todoConfigurationSysId = todoConfigGr.getUniqueValue();
        todoConfigRecord.widgetMappings = this._getWidgetMappings(todoConfigGr.getUniqueValue());
        return todoConfigRecord;
    },

    getStateLabel: function(todo) {
        var stateLabel = "";
        if (todo.sys_class_name == "sn_lxp_learning_task")
            stateLabel = gs.getMessage('{0}', [todo.getDisplayValue('state')]);
        else if (todo.sys_class_name == "sn_hr_integr_fw_todo_inbound") {
            stateLabel = todo.getValue('todo_state') == 3 ? gs.getMessage('Completed') : todo.getDisplayValue('todo_state');
        } else if (todo.sys_class_name == "sn_doc_task" && todo.getValue('state') == 7) { // Closed Rejected
            stateLabel = gs.getMessage('Completed');
        } else if (todo.sys_class_name == "sn_hr_core_task" && todo.getValue('state') == 7) //Canceled
            stateLabel = gs.getMessage('Canceled');
        else {
            if (todo.getValue('state') == 3) //Closed Completed
                stateLabel = gs.getMessage('Completed');
            else if (todo.getValue('state') == 9) //Skipped
                stateLabel = gs.getMessage('Skipped');
            else if (todo.getValue('state') == 4) //Closed Incomplete
                stateLabel = gs.getMessage('Closed');
            else
                stateLabel = todo.getDisplayValue('state');
        }

        return stateLabel;
    },

    isTerminalState: function(todo) {
        var isCompleted = false;

        var todoState = todo.getValue(todoPageUtils.FIELD_TODOS_STATE);
        // Closed Completed, Skipped, Closed Incomplete or Cancelled
        if (todoState == 3 || todoState == 9 || todoState == 4 || todoState == 7)
            isCompleted = true;

        return isCompleted;
    },

    /*
     * To get the count of todos based on todo configurations
     * @input
     * *filters : optional filters to apply
     * *params : optional parameters for filtering
     * *isLimitCount : optional boolean to limit the count
     * *showApprovalsOnly : optional boolean - if true, only fetch sysapproval_approver table configs
     * *totalTodoLimit : optional number - if present, used instead of LIMIT_TODOS_FETCH
     * @output JSON object with record watcher details and record count
     */
    getMyTodosCount: function(filters, params, isLimitCount, showApprovalsOnly, totalTodoLimit) {
        var myTodosResult = {};
        var recordWatchersList = [];
        var todoCount = 0;
        var todoQuery;
        isLimitCount = isLimitCount ? isLimitCount : false;

        // Determine the limit to use
        var limitToUse = totalTodoLimit ? totalTodoLimit : todoPageUtils.LIMIT_TODOS_FETCH;

        var todoConfigList = filters ? this._getTodoQueryInfoByfilters(false, filters, params, null, showApprovalsOnly) : this._getTodoQueryInfo(false, todoPageUtils.OPEN_TAB, showApprovalsOnly);

        //for each todo configuration record
        for (var i = 0; i < todoConfigList.length; i++) {
            if (isLimitCount && todoCount >= limitToUse) {
                break;
            }
            var todoRecord = todoConfigList[i];
            if (todoRecord.tab !== 'completed') {
                // add the record watcher for the todo configurations
                var recordWatcher = {};
                recordWatcher.table = todoRecord.table;
                recordWatcher.filter = this._addTaskFilters(todoRecord.condition, true);
                recordWatchersList.push(recordWatcher);

                // get the count of todos
                if ((isLimitCount && todoCount < limitToUse) || (!isLimitCount)) {
                    todoQuery = this._getClosureFunction(todoRecord.table, todoRecord.condition, true)();
                    todoQuery.query();
                    while (todoQuery.next() && (!isLimitCount || todoCount < limitToUse)) {
                        if (todoQuery.canRead()) {
                            todoCount++;
                        }
                    }
                }
            }
        }

        myTodosResult.recordWatchers = recordWatchersList;
        myTodosResult.todoCount = todoCount;

        return myTodosResult;
    },


    /*
     * To get the todos based on todo configurations
     * @input
     * *limit : maximum limit for list of todo to be returned,
     * *excludeList : list of sysIds to exclude in the consequent calls
     * *includeSysId : sysId of specific todo to be included in return
     * *filters : optional filters to apply
     * *params : optional parameters for filtering
     * *todoPageFilterConditions : optional filter conditions mapping
     * *applyFilter : boolean to determine if filters should be applied
     * *tab : tab name (e.g., 'open', 'completed')
     * *showApprovalsOnly : optional boolean - if true, only fetch sysapproval_approver table configs
     * *totalTodoLimit : optional number - if present, used instead of LIMIT_TOTAL_TODOS
     * @output JSON Object
     */
    getMyTodos: function(limit, excludeList, includeSysId, filters, params, todoPageFilterConditions, applyFilter, tab, showApprovalsOnly, totalTodoLimit) {

        var todoConfigList = [];
        if (todoPageFilterConditions) {
            var configurationList = Object.keys(todoPageFilterConditions);
        }

        if (todoPageFilterConditions && configurationList.length > 0) {
            todoConfigList = this._getTodoListForFilters(true, configurationList, params, todoPageFilterConditions, tab, showApprovalsOnly);
        } else if (filters) {
            todoConfigList = this._getTodoQueryInfoByfilters(true, filters, params, tab, showApprovalsOnly);
        } else if (!applyFilter) {
            todoConfigList = this._getTodoQueryInfo(true, tab, showApprovalsOnly);
        }

        if (includeSysId)
            return this._constructTodosList(todoConfigList, limit, excludeList, includeSysId, tab, totalTodoLimit, showApprovalsOnly);
        return this._constructTodosList(todoConfigList, limit, excludeList, undefined, tab, totalTodoLimit, showApprovalsOnly);
    },


    _getTodoListForFilters: function(includeDisplayDetails, configIds, params, todoPageFilterConditions, tab, showApprovalsOnly) {
        var todoConfigList = [];
        var todoConfigGr = new GlideRecord("sn_hr_sp_todos_config");
        todoConfigGr.addActiveQuery();
        todoConfigGr.addQuery("sys_id", "IN", configIds);
        if (tab) {
            todoConfigGr.addQuery("tab", tab);
        }
        // Add filter for approvals only if parameter is set to true
        if (showApprovalsOnly === true) {
            todoConfigGr.addQuery("table", "sysapproval_approver");
        }
        todoConfigGr.orderBy("display_priority");
        todoConfigGr.query();
        while (todoConfigGr.next()) {

            var todoConfigRecord = {};
            todoConfigRecord.table = todoConfigGr.table.toString();
            todoConfigRecord.tab = todoConfigGr.tab.toString();
            todoConfigRecord.condition = todoPageFilterConditions[todoConfigGr.sys_id].toString();
            if (includeDisplayDetails) {
                todoConfigRecord.displayRowDetailsJson = this._getDisplayRowDetails(todoConfigGr);
                todoConfigRecord.todoConfigurationSysId = todoConfigGr.getUniqueValue();
                todoConfigRecord.widgetMappings = this._getWidgetMappings(todoConfigGr.sys_id);
                todoConfigRecord.taskConfigurations = this._getTaskConfigurations(todoConfigGr.sys_id);
            }

            todoConfigList.push(todoConfigRecord);

        }
        return todoConfigList;
    },
    /*
     * To get the open todos based on todo configurations 
     * @input  
     * *limit : maximum limit for list of todo to be returned
     * @output JSON Object 
     */
    getMyOpenTodos: function(limit) {
        var todoConfigList = this._getTodoQueryInfo(false, todoPageUtils.OPEN_TAB);
        return this._constructTodoDetailList(todoConfigList, limit);
    },

    getTabs: function() {
        var choiceList = GlideChoiceList.getChoiceList('sn_hr_sp_todos_config', 'tab');
        var result = [];
        for (var j = 0; j < choiceList.getSize(); j++) {
            var choice = choiceList.getChoice(j);
            result.push({
                name: choice.getValue(),
                label: choice.getLabel()
            });
        }
        return result;
    },

    // Get the id of to-do page showing single to-do
    getTodoPageId: function() {
        return todoPageUtils.TODO_PAGE_ID;
    },

    // Get the id of to-do page showing all to-dos
    getAllTodoPageId: function() {
        return todoPageUtils.ALL_TODO_PAGE_ID;
    },

    splitInTabs: function(todos, defaultTab, limit, includeSysId) {
        var result = {};
        var todo, tab;
        for (var i = 0; i < todos.length; i++) {
            todo = todos[i];
            tab = (todo.tab) ? todo.tab : defaultTab;
            result[tab] = result[tab] || [];
            if (tab == 'completed') {
                todo.isCompleted = true;
            }

            if (!limit || limit > result[tab].length) {
                result[tab].push(todo);
            } else if (includeSysId && todo.sysId == includeSysId) {
                // Included to-do found after limit reached, replace last item with included to-do
                result[tab].pop();
                result[tab].push(todo);
            }
        }
        return result;
    },
    // construct the todo list based on the display priority property
    constructTodosList: function(todoConfigList, limit, excludeList, includeSysId, tab, totalTodoLimit, showApprovalsOnly) {
        return this._constructTodosList(todoConfigList, limit, excludeList, includeSysId, tab, totalTodoLimit, showApprovalsOnly);
    },

    // construct the todo list based on the display priority property
    _constructTodosList: function(todoConfigList, limit, excludeList, includeSysId, tab, totalTodoLimit, showApprovalsOnly) {
        // Default to false if not provided for backward compatibility
        showApprovalsOnly = showApprovalsOnly || false;
        var todosList;

        // sn_hr_sp.todos_config_display_with_priority sys property value
        var disPrtzPropValue = this._getTodoDisplayPropertyValue();

        // Determine the total limit to use - prioritize parameter over default constant
        var limitToUse = totalTodoLimit ? totalTodoLimit : todoPageUtils.LIMIT_TOTAL_TODOS;

        // if the property value is true get todo by display priority column
        if (disPrtzPropValue == 'true')
            todosList = this._checkPrioritizedQueries(todoConfigList, limitToUse, limit, excludeList, includeSysId, showApprovalsOnly);
        else
            todosList = this._checkUnprioritizedQueries(todoConfigList, limitToUse, limit, excludeList, includeSysId, showApprovalsOnly);

        var tabs = this.getTabs();

        todosList.recordsToShow = this._sortCompletedTodos(todosList.recordsToShow);
        todosList.recordsToShow = this.splitInTabs(todosList.recordsToShow, tabs[0].name, limit, includeSysId);

        return todosList;
    },

    _sortCompletedTodos: function(todos) {
        var openTodos = [],
            completedTodos = [];
        for (var i = 0; i < todos.length; i++) {
            var todo = todos[i];
            if (todo.tab == 'completed')
                completedTodos.push(todo);
            else
                openTodos.push(todo);
        }
        completedTodos.sort(this._sortByClosedAtFunction);
        return openTodos.concat(completedTodos);
    },

    // get the list of todos by display priority column sorted by due date with in todo configurations
    _checkPrioritizedQueries: function(todoConfigList, slotsToFill, tabLimit, excludeList, includeSysId, showApprovalsOnly) {
        // Default to false if not provided for backward compatibility
        var addSysapprovalFields = showApprovalsOnly === true;
        var todosIds = {
            recordsToShow: [],
            recordWatchers: this._buildRecordWatchers(todoConfigList),
        };

        var sortedTodos = [];
        var index = 0;
        for (var idx = 0; idx < todoConfigList.length && sortedTodos.length < slotsToFill; idx++) {
            var todoConfigListRecord = todoConfigList[idx];

            var dueDateSortedTodos = this._getPrioritizedDueDateRecord([todoConfigListRecord], (slotsToFill - sortedTodos.length), tabLimit, excludeList, true, addSysapprovalFields);
            sortedTodos = sortedTodos.concat(dueDateSortedTodos);

            var emptySortedTodos = this._getEmptyDueDateRecord([todoConfigListRecord], (slotsToFill - sortedTodos.length), tabLimit, excludeList, true, addSysapprovalFields);
            sortedTodos = sortedTodos.concat(emptySortedTodos);


        }

        // if includeSysId todo was not found, add it to the result array if possible
        if (includeSysId)
            sortedTodos = this._ensureIncludedTodo(sortedTodos, todoConfigList, includeSysId, addSysapprovalFields);

        todosIds.recordsToShow = sortedTodos;
        return todosIds;

    },



    // get the list of todos sorted by due date accross all the todo configurations
    _checkUnprioritizedQueries: function(todoConfigList, slotsToFill, tabLimit, excludeList, includeSysId, showApprovalsOnly) {
        // Default to false if not provided for backward compatibility
        var addSysapprovalFields = showApprovalsOnly === true;
        var todosIds = {
            recordsToShow: [],
            recordWatchers: this._buildRecordWatchers(todoConfigList),
        };
        var unSortedTodos = [];
        var queryStatus = this._initializeQueryStatus(todoConfigList, tabLimit, excludeList, false);
        var index = 0;

        while (index < queryStatus.length) {
            var todoGr = queryStatus[index].queryGr;
            if (!todoGr.next()) {
                index++;
                continue;
            }
            if (!todoGr.canRead())
                continue;

            var recordInfo = this._getRecordInfo(todoGr, queryStatus[index], addSysapprovalFields);
            if (recordInfo) {
                recordInfo.tab = queryStatus[index].tab;
                unSortedTodos.push(recordInfo);
            }
        }

        // if the list length is more than 1 then sort else return the list
        if (unSortedTodos.length > 1)
            unSortedTodos.sort(this._sortByDueDateFunction);

        var sortedTodos = unSortedTodos.slice(0, slotsToFill);


        // if the sorted todos is less the slotsToFill then get todos with empty due dates
        if (sortedTodos.length < slotsToFill) {
            var emptySortedTodos = this._getEmptyDueDateRecord(todoConfigList, (slotsToFill - sortedTodos.length), tabLimit, excludeList, false, addSysapprovalFields);
            sortedTodos = sortedTodos.concat(emptySortedTodos);
        }

        // if includeSysId todo was not found, add it to the result array if possible
        if (includeSysId)
            sortedTodos = this._ensureIncludedTodo(sortedTodos, todoConfigList, includeSysId, addSysapprovalFields);

        todosIds.recordsToShow = sortedTodos;
        return todosIds;
    },

    // add specifically included todo to end if doesn't already exist in array
    _ensureIncludedTodo: function(todoList, todoConfigList, includeSysId , addSysapprovalFields) {
        // Check if todo already in list
        for (var idx = 0; idx < todoList.length; idx++)
            if (todoList[idx].sysId == includeSysId)
                return todoList;
        // Adding todo to list if possible
        var queryStatus = this._initializeQueryStatus(todoConfigList, "", [], true, includeSysId);
        if (queryStatus.length == 0)
            queryStatus = this._initializeQueryStatus(todoConfigList, "", [], false, includeSysId);
        if (queryStatus.length > 0 && queryStatus[0].queryGr.next() && queryStatus[0].queryGr.canRead()) {
            var recordInfo = this._getRecordInfo(queryStatus[0].queryGr, queryStatus[0], addSysapprovalFields);
            if (recordInfo) {
                recordInfo.tab = queryStatus[0].tab;
                todoList.push(recordInfo);
            }
        }
        return todoList;
    },

    // get the list of todos sorted by updated date for a particular display priority
    _getPrioritizedDueDateRecord: function(todoConfigList, slotsToFill, tabLimit, excludeList, isPrioritized, addSysapprovalFields) {
        // Default to false if not provided for backward compatibility
        addSysapprovalFields = addSysapprovalFields || false;
        var recordList = [];
        if (slotsToFill <= 0)
            return recordList;
        var queryStatus = this._initializeQueryStatus(todoConfigList, tabLimit, excludeList, false);
        var index = 0;
        while (index < queryStatus.length) {
            if (isPrioritized && recordList.length >= slotsToFill)
                break;
            var todoGr = queryStatus[index].queryGr;
            if (!todoGr.next()) {
                index++;
                continue;
            }
            if (!todoGr.canRead())
                continue;

            var recordInfo = this._getRecordInfo(todoGr, queryStatus[index], addSysapprovalFields);
            recordInfo.tab = queryStatus[index].tab;
            recordList.push(recordInfo);
        }
        return recordList;
    },


    // get the list of todos sorted by updated date
    _getEmptyDueDateRecord: function(todoConfigList, slotsToFill, tabLimit, excludeList, isPrioritized, addSysapprovalFields) {
        // Default to false if not provided for backward compatibility
        addSysapprovalFields = addSysapprovalFields || false;
        var recordList = [];
        if (slotsToFill <= 0)
            return recordList;
        var queryStatus = this._initializeQueryStatus(todoConfigList, tabLimit, excludeList, true);
        var index = 0;
        while (index < queryStatus.length) {
            if (isPrioritized && recordList.length >= slotsToFill)
                break;
            var todoGr = queryStatus[index].queryGr;
            if (!todoGr.next()) {
                index++;
                continue;
            }
            if (!todoGr.canRead())
                continue;

            var recordInfo = this._getRecordInfo(todoGr, queryStatus[index], addSysapprovalFields);
            if (recordInfo) {
                recordInfo.tab = queryStatus[index].tab;
                recordList.push(recordInfo);
            }
        }

        // if the list length is more than 1 then sort else return the list
        if (recordList.length > 1)
            recordList.sort(this._sortByCreatedOnFunction);

        if (!isPrioritized)
            recordList = recordList.slice(0, slotsToFill);
        return recordList;
    },


    // sort by ascending order function to compare the due date
    _sortByDueDateFunction: function(todoRecordData1, todoRecordData2) {

        if (!todoRecordData1.due_date)
            return (Number.MAX_VALUE);

        if (!todoRecordData2.due_date)
            return -(Number.MAX_VALUE);

        var todoRecordDate1 = new GlideDateTime(todoRecordData1.due_date);
        var todoRecordDate2 = new GlideDateTime(todoRecordData2.due_date);

        return todoRecordDate1.compareTo(todoRecordDate2);
    },


    // sort by ascending order function to compare the created on date
    _sortByCreatedOnFunction: function(todoRecordData1, todoRecordData2) {

        if (!todoRecordData1.createdOn)
            return (Number.MAX_VALUE);

        if (!todoRecordData2.createdOn)
            return -(Number.MAX_VALUE);

        var todoRecordDate1 = new GlideDateTime(todoRecordData1.createdOn);
        var todoRecordDate2 = new GlideDateTime(todoRecordData2.createdOn);

        return todoRecordDate1.compareTo(todoRecordDate2);
    },

    // sort by descending order function to compare the closed at date
    _sortByClosedAtFunction: function(todoRecordData1, todoRecordData2) {

        if (!todoRecordData1.closedAt)
            return (Number.MAX_VALUE);

        if (!todoRecordData2.closedAt)
            return -(Number.MAX_VALUE);

        var todoRecordDate1 = new GlideDateTime(todoRecordData1.closedAt);
        var todoRecordDate2 = new GlideDateTime(todoRecordData2.closedAt);

        return todoRecordDate2.compareTo(todoRecordDate1);
    },

    // construct the record watchers list consumed by Service Portal
    _buildRecordWatchers: function(todoConfigList) {
        var recordWatchers = [];
        for (var i = 0; i < todoConfigList.length; i++) {
            var todoRecord = todoConfigList[i];
            var recordWatcher = {};
            recordWatcher.table = todoRecord.table;
            recordWatcher.filter = this._addTaskFilters(todoRecord.condition, true);
            recordWatcher.tab = todoRecord.tab;
            recordWatchers.push(recordWatcher);
        }

        return recordWatchers;
    },


    //inititalize the GlideRecord call on the tables mentioned in todo configuration records
    _initializeQueryStatus: function(todoConfigList, tabLimit, excludeList, includeEmptyDueDateRecs, includeOnlySysId) {
        var queryStatus = [];
        // use the limit from the widget or use default limit
        var queryLimit = tabLimit != "" ? tabLimit : todoPageUtils.QUERY_LIMIT;

        for (var i = 0; i < todoConfigList.length; i++) {
            var todoRecord = todoConfigList[i];

            //We have already fetched empty due date records for todo configs which do not have valid due_date field
            if (includeEmptyDueDateRecs && !this._checkFieldValidity(todoRecord.table, 'due_date'))
                continue;

            //call the closure function with isAggregate value false
            var queryInstanceGr = this._getClosureFunction(todoRecord.table, todoRecord.condition, false, includeEmptyDueDateRecs, todoRecord.tab)(excludeList);
            if (includeOnlySysId)
                queryInstanceGr.addQuery("sys_id", includeOnlySysId);
            else
                queryInstanceGr.chooseWindow(0, queryLimit);
            queryInstanceGr.query();
            if (queryInstanceGr.hasNext()) {
                queryStatus.push({
                    queryGr: queryInstanceGr,
                    displayRowDetailsJson: todoRecord.displayRowDetailsJson,
                    todoConfigurationSysId: todoRecord.todoConfigurationSysId,
                    widgetMappings: todoRecord.widgetMappings,
                    tab: todoRecord.tab,
                    taskConfigurations: todoRecord.taskConfigurations
                });
            }
        }

        return queryStatus;
    },

    // get detailed information for the todo record
    _getRecordInfo: function(queryGr, queryStatus, addSysapprovalFields) {
        // Default to false if not provided for backward compatibility
        addSysapprovalFields = addSysapprovalFields || false;
        if (queryGr.getRecordClassName() === "sn_cd_task" && queryGr.getElement("content_todo.active").toString() !== "true")
            return null;

        var todoRecordData = {};

        todoRecordData.sysId = queryGr.getUniqueValue();
        todoRecordData.tableName = queryGr.getTableName();
        todoRecordData.isApprovalTable = todoRecordData.tableName == 'sysapproval_approver' ? true : false;

        //todo number
        var todoNumber = "";
        if (todoRecordData.isApprovalTable && !gs.nil(queryGr.sysapproval))
            todoNumber = queryGr.getDisplayValue('sysapproval');
        else if (!gs.nil(queryGr.number))
            todoNumber = queryGr.getValue('number');
        todoRecordData.todoNumber = todoNumber;
        if (todoRecordData.tableName == 'sn_hr_integr_fw_todo_inbound') {
            todoRecordData.state = queryGr.getDisplayValue('todo_state');
            todoRecordData.state_num_value = queryGr.getValue('todo_state');

        } else {
            todoRecordData.state = queryGr.getDisplayValue('state');
            todoRecordData.state_num_value = queryGr.getValue('state');
        }

        var stateLabel = this.getStateLabel(queryGr);

        todoRecordData.stateLabel = stateLabel;
        //Todo Header Display Values
        todoRecordData.displayValueList = [];
        var displayRowJson = queryStatus.displayRowDetailsJson;

        //titleRow
        todoRecordData.displayValueList.push(this._getTitleRowDisplayValue(displayRowJson, queryGr));

        //detail Row
        todoRecordData.displayValueList.push(this._getDetailRowDisplayValue(displayRowJson, queryGr, todoRecordData.isApprovalTable));

        //url
        todoRecordData.url = this._getTaskUrl(displayRowJson, queryGr, todoRecordData.isApprovalTable, todoRecordData.tableName);

        //delegates
        if (this._delegationActive)
            if (queryGr.assigned_to == gs.getUserID() || queryGr.approver == gs.getUserID() && queryGr.getTableName() === 'sysapproval_approver')
                todoRecordData.delegates = new global.Delegation().getDelegatedTo(queryGr);
            else
                // need to get delegator's name for tooltip if current user is a delegate
                todoRecordData.delegator = new global.Delegation().getSingleRecordDelegator(todoRecordData.sysId);

        // get the todo configuration record sysId and widgetmappings
        todoRecordData.todoConfigurationSysId = queryStatus.todoConfigurationSysId;
        todoRecordData.widgetMappings = queryStatus.widgetMappings;

        //get the task configuration record
        todoRecordData.taskConfigurationSysId = this._getTaskConfigurationSysId(queryStatus.taskConfigurations, queryGr);

        // get the due date values
        todoRecordData.hasDueDate = false;
        var isValidDueDateField = this._checkFieldValidity(queryGr.getTableName(), 'due_date');
        if (isValidDueDateField) {
            todoRecordData.hasDueDate = true;
            todoRecordData.due_date = queryGr.getValue('due_date');
            todoRecordData.dueDateDisplayValue = this._getDueDateTextValue(todoRecordData.due_date);
            todoRecordData.hasDueDateWarning = this._getDueDateWarning(todoRecordData.due_date);
        }

        // optional label
        todoRecordData.optionalLabel = this._getOptionalLabel(queryGr);
        var isValidClosedAtField = this._checkFieldValidity(queryGr.getTableName(), 'closed_at');
        if (isValidClosedAtField) {
            todoRecordData.closedAt = queryGr.getValue('closed_at');
        } else if (queryStatus.tab === 'completed') {
            todoRecordData.closedAt = queryGr.getValue('sys_updated_on');
        }

        todoRecordData.createdOn = queryGr.getValue('sys_created_on');

        // For approval tables, fetch additional fields from sysapproval record (only when showApprovalsOnly is true)
        if (todoRecordData.isApprovalTable && addSysapprovalFields && !gs.nil(queryGr.sysapproval)) {
            // Add requested_for from sysapproval
            if (queryGr.sysapproval.requested_for) {
                todoRecordData.sysapproval_requested_for = queryGr.sysapproval.requested_for.toString();
                todoRecordData.sysapproval_requested_forDisplay = queryGr.sysapproval.requested_for.getDisplayValue();
            }

            // Add priority from sysapproval
            if (queryGr.sysapproval.priority) {
                todoRecordData.sysapproval_priority = queryGr.sysapproval.getValue('priority');
                todoRecordData.sysapproval_priorityDisplay = queryGr.sysapproval.getDisplayValue('priority');
            }

            // Add description from sysapproval
            if (queryGr.sysapproval.description) {
                todoRecordData.sysapproval_description = queryGr.sysapproval.getValue('description');
            }

            // Add cat_item from sysapproval
            if (queryGr.sysapproval.cat_item) {
                todoRecordData.sysapproval_cat_item = queryGr.sysapproval.cat_item.toString();
                todoRecordData.sysapproval_cat_itemDisplay = queryGr.sysapproval.cat_item.getDisplayValue();
                if(queryGr.sysapproval.cat_item.picture) {
                    todoRecordData.sysapproval_cat_itemImage = queryGr.sysapproval.cat_item.picture.toString();
                }
            }
        }

        return todoRecordData;
    },

    //get task configuration for the task
    _getTaskConfigurationSysId: function(taskConfigurations, queryGr) {
        var parentTaskConfigSysId = '';
        for (var taskConfig in taskConfigurations) {
            var additionalConditions = taskConfigurations[taskConfig].additional_conditions;
            var referenceColumn = taskConfigurations[taskConfig].reference_column;
            var referenceTable = taskConfigurations[taskConfig].reference_table;
            var referenceConditions = taskConfigurations[taskConfig].reference_conditions;
            var taskConfigSysId = taskConfigurations[taskConfig].sysId;

            if (!queryGr.source_table && !queryGr.document_id && queryGr.sysapproval && queryGr.sysapproval.getRefRecord()) {
                queryGr.source_table = queryGr.sysapproval.getRefRecord().getTableName();
            }

            if (additionalConditions && !GlideFilter.checkRecord(queryGr, additionalConditions)) {
                continue;
            }
            if (referenceColumn && referenceTable) {
                if (queryGr[referenceColumn] && queryGr[referenceColumn].getED().getInternalType() === 'table_name') {
                    var sysDictionaryGr = new GlideRecord('sys_dictionary');
                    sysDictionaryGr.addQuery('name', queryGr.getTableName());
                    sysDictionaryGr.addQuery('internal_type', 'document_id');
                    sysDictionaryGr.addActiveQuery();
                    sysDictionaryGr.query();
                    if (sysDictionaryGr.next()) {
                        var documentIdColumn = sysDictionaryGr.element;
                        if (queryGr[documentIdColumn] && queryGr[documentIdColumn].getRefRecord()) {
                            var taskTable = queryGr[documentIdColumn].getRefRecord().getTableName();
                            var tableGr = new GlideTableHierarchy(taskTable);
                            var parentTaskTable = tableGr.getBase();
                            if (taskTable === referenceTable || parentTaskTable === referenceTable) {
                                if (referenceConditions && !GlideFilter.checkRecord(queryGr[documentIdColumn].getRefRecord(), referenceConditions)) {
                                    continue;
                                }
                                if (taskTable === referenceTable) {
                                    return taskConfigSysId;
                                } else {
                                    parentTaskConfigSysId = taskConfigSysId;
                                }
                            }
                        }
                    }
                    continue;
                } else {
                    if (queryGr[referenceColumn] && queryGr[referenceColumn].getRefRecord()) {
                        var taskTable = queryGr[referenceColumn].getRefRecord().getTableName();
                        var tableGr = new GlideTableHierarchy(taskTable);
                        var parentTaskTable = tableGr.getBase();
                        if (taskTable === referenceTable) {
                            return taskConfigSysId;
                        } else if (parentTaskTable === referenceTable) {
                            parentTaskConfigSysId = taskConfigSysId;
                        }
                    }
                    continue;
                }
            }
            return taskConfigSysId;
        }
        return parentTaskConfigSysId ? parentTaskConfigSysId : '';
    },

    // get the label value to display whether a todo is optional or required
    _getOptionalLabel: function(gr) {
        if ((gr.isValidField('optional') && gr.getValue('optional') == 1) ||
            (gr.isValidField('mandatory') && gr.getValue('mandatory') == 0)) //sn_ja_task
            return gs.getMessage('Optional');
    },

    //wrapper function for _getDueDateTextValue
    getTaskDueDateDisplayValue: function(dueDate) {
        return this._getDueDateTextValue(dueDate);
    },

    // check if a todo should have a due date warning
    _getDueDateWarning: function(dueDate) {
        if (!dueDate)
            return false;
        var gdtDueDate = new GlideDateTime(dueDate);

        var gdtWarn = new GlideDateTime();

        // Warn time is 2 days
        var warnOffset = new GlideTime();
        warnOffset.setValue('48:00:00');

        // Get the cutoff time for the warning
        gdtWarn.add(warnOffset);

        return gdtWarn.onOrAfter(gdtDueDate);
    },

    // get the due date text values
    _getDueDateTextValue: function(dueDate) {
        var dueDateDisplayValue = "";
        if (!gs.nil(dueDate)) {
            var dueDays = this._getDueDays(dueDate + '');
            if (dueDays < 0) {
                if (dueDays == -1)
                    dueDateDisplayValue = gs.getMessage('Overdue {0} day', String(0 - dueDays));
                else
                    dueDateDisplayValue = gs.getMessage('Overdue {0} days', String(0 - dueDays));
            } else {
                if (dueDays == 1)
                    dueDateDisplayValue = gs.getMessage('Due in {0} day', dueDays);
                else if (dueDays == 0)
                    dueDateDisplayValue = gs.getMessage('Due today');
                else
                    dueDateDisplayValue = gs.getMessage('Due in {0} days', dueDays);
            }
        } else
            dueDateDisplayValue = gs.getMessage('No due date');
        return dueDateDisplayValue;
    },


    // get the display values from title row fields of todo configurations
    _getTitleRowDisplayValue: function(displayRowJson, queryGr) {
        var titleRowValue = "";
        var titleRowJson = displayRowJson.titleRow;
        if (titleRowJson.titleType == "custom")
            titleRowValue = titleRowJson.customTitle;
        else if (titleRowJson.titleType == "fields")
            titleRowValue = this._getFieldDisplayValue(queryGr, titleRowJson.titleField);
        return titleRowValue;
    },

    // get the display values from detail row fields of todo configurations
    _getDetailRowDisplayValue: function(displayRowJson, queryGr, isApprovalTable) {
        return this._getDetailRowValueWithFormat(displayRowJson, queryGr, isApprovalTable, false);
    },

    _getDetailRowValueWithFormat: function(displayRowJson, queryGr, isApprovalTable, returnAsArray) {
        returnAsArray = returnAsArray || false;
        var detailRowValue = returnAsArray ? [] : "";
        var detailRowValueJson = displayRowJson.detailRow;
        var parentRefCol = this._getParentRefColumn(queryGr, isApprovalTable);
        if (detailRowValueJson.detailType == "custom") {
            if (returnAsArray) {
                detailRowValue.push(detailRowValueJson.customDetail);
            } else {
                detailRowValue = detailRowValueJson.customDetail;
            }
        } else if (detailRowValueJson.detailType == "parent_fields")
            detailRowValue = this._getParentRecordDetails(detailRowValueJson.parentTable, parentRefCol, detailRowValueJson.parentFields, queryGr, returnAsArray);
        else if (detailRowValueJson.detailType == "fields")
            detailRowValue = this._getRowRecordDetails(false, queryGr, detailRowValueJson.detailFields, returnAsArray);

        return detailRowValue;
    },


    //get the parent reference column the given todo record
    _getParentRefColumn: function(queryGr, isApprovalTable) {
        if (isApprovalTable)
            return queryGr.sysapproval;
        if (queryGr.sys_class_name == "sn_ja_task")
            return queryGr.ja_stage.ja_plan;
        else
            return queryGr.parent;
    },


    // get the todo task url to be display when detail row is clicked
    _getTaskUrl: function(displayRowJson, queryGr, isApprovalTable, tableName) {
        var urlToLinkTask = "";
        var detailRowJson = displayRowJson.detailRow;
        var parentRefCol = this._getParentRefColumn(queryGr, isApprovalTable);
        if (detailRowJson.detailType == "parent_fields" && detailRowJson.linkToParent) {
            if (this._hrCoreActive && !gs.nil(parentRefCol) && hr_PortalUtil._hrCaseTables.indexOf(String(parentRefCol.sys_class_name)) != -1)
                parentRefCol = this._getRollUpParentRecord(queryGr);
            if (this._journeyActive && !gs.nil(parentRefCol) && queryGr.sys_class_name == 'sn_ja_task')
                parentRefCol = this._getJourneyRecord('ja_plan', queryGr.ja_stage.ja_plan);
            if (this._egdCoreActive && !gs.nil(parentRefCol) && queryGr.sys_class_name == 'sn_egd_core_plan_activity') {
                parentRefCol = new GlideRecord('sn_egd_core_plan');
                if (!parentRefCol.get(queryGr.parent))
                    parentRefCol = null;
            }

            if (!gs.nil(parentRefCol)) {
                var parentSysId = parentRefCol.sys_id ? parentRefCol.sys_id : parentRefCol.getUniqueValue();
                var parentTable = parentRefCol.sys_class_name ? parentRefCol.sys_class_name : parentRefCol.getTableName();
                urlToLinkTask = this._getUrlString(parentSysId, parentTable);
            }
        } else if (detailRowJson.linkToTask && tableName != 'sysapproval_approver')
            urlToLinkTask = this._getUrlString(queryGr.sys_id, queryGr.sys_class_name);
        else if (detailRowJson.linkToTask && tableName == 'sysapproval_approver') {
            if (this._egdCoreActive && queryGr.source_table == 'sn_egd_core_plan_activity') {
                var activityGr = new GlideRecord('sn_egd_core_plan_activity');
                if (activityGr.get(queryGr.sysapproval))
                    urlToLinkTask = this._getUrlString(activityGr.getValue('parent'), 'sn_egd_core_plan');
            } else if (!gs.nil(queryGr.sysapproval))
                urlToLinkTask = this._getUrlString(queryGr.sysapproval, queryGr.sysapproval.sys_class_name);
        }

        return urlToLinkTask;

    },

    // get the hrm ticket page url if HR case or generic task url
    _getUrlString: function(sysId, tableName) {
        if (gs.nil(sysId) || gs.nil(tableName))
            return "";
        if (this._hrCoreActive && hr_PortalUtil._hrCaseTables.indexOf(String(tableName)) != -1) {
            if (this._hrLEActive && this._journeyActive) {
                // check if root LE case is a part of a journey
                var parentJourneyGr = this._getJourneyRecord('le_case', sysId);
                if (parentJourneyGr && parentJourneyGr.canRead()) {
                    // Only link to the jny_journey_details if the user has access to the record and can view the portal UI
                    var jnyUtil = new sn_jny.jny_journeyDetailsPageUtils();
                    if (!jnyUtil.hasUserPersona || jnyUtil.hasUserPersona(parentJourneyGr))
                        return "?id=jny_journey_details&sys_id=" + parentJourneyGr.getUniqueValue();
                }
            }
            // task that is a part of a standalone case
            return "?id=hrm_ticket_page&sys_id=" + sysId + "&table=" + tableName;
        }
        // ja tasks
        if (this._journeyActive && tableName === 'sn_jny_journey')
            return "?id=jny_journey_details&sys_id=" + sysId;
        if (this._egdCoreActive && tableName == 'sn_egd_core_plan')
            return "?id=egd_gp_details&sys_id=" + sysId;

        return "?sys_id=" + sysId + "&view=sp&id=ticket&table=" + tableName;
    },

    // get the task URL
    getApprovalHubTaskUrl: function(tableName, sysId) {
        var todoLineGr = new GlideRecord(tableName);
        var url = "";
        if (todoLineGr.get(sysId)) {
            if (tableName != 'sysapproval_approver')
                url = this._getUrlString(todoLineGr.sys_id, todoLineGr.sys_class_name);
            else if (tableName == 'sysapproval_approver' && !gs.nil(todoLineGr.sysapproval))
                url = this._getUrlString(todoLineGr.sysapproval, todoLineGr.sysapproval.sys_class_name);

        }
        return url;
    },


    // get the display value of the field
    _getFieldDisplayValue: function(queryGr, field) {
        if (field == "short_description")
            return new sn_hr_sp.hr_PortalUtil().getRecordShortDescription(queryGr);
        if (field == "rich_description")
            return new sn_hr_sp.hr_PortalUtil().getRecordDescription(queryGr);
        var fieldValue = this._getFieldValue(queryGr, field);
        if (!gs.nil(fieldValue))
            return fieldValue.getDisplayValue();
        return "";
    },

    // get the display value of the field
    _getFieldValue: function(queryGr, field) {
        if (field) {
            var fieldValue = queryGr.getElement(field);
            if (!gs.nil(fieldValue))
                return fieldValue;
        }
        return "";
    },

    // get the parent record details for the todo record
    _getParentRecordDetails: function(parentTable, parentSysId, parentColumns, queryGr, returnAsArray) {
        var parentRowValList = [];
        var parentColList = [];

        if (this._hrCoreActive && parentTable == 'sn_hr_core_case')
            parentSysId = this._getRollUpParentRecord(queryGr);

        if (this._journeyActive && parentTable == 'sn_jny_journey') {
            var refField = queryGr.sys_class_name == 'sn_ja_task' ? 'ja_plan' : 'le_case';
            var refId = refField === 'le_case' ? this._getRollUpParentRecord(queryGr) : queryGr.ja_stage.ja_plan;
            var jnyGr = this._getJourneyRecord(refField, refId);
            parentSysId = jnyGr ? jnyGr.getUniqueValue() : '';
        }

        var parentGr = new GlideRecord(parentTable);
        if (parentGr.get(parentSysId)) {
            parentColList = parentColumns.split(',');
            for (var i = 0; i < parentColList.length; i++)
                parentRowValList.push(this._getFieldDisplayValue(parentGr, parentColList[i]));
        }
        return returnAsArray ? parentRowValList : parentRowValList.join(' - ');
    },


    // HR cases rollup the parent record information to three levels
    _getRollUpParentRecord: function(queryGr) {
        var parentLevels = ['parent.parent.parent', 'parent.parent', 'parent'];
        for (var i = 0; i < parentLevels.length; i++) {
            var tableNameCol = parentLevels[i] + ".sys_class_name";
            var subjectPersonAccess = parentLevels[i] + ".hr_service.subject_person_access";

            //parent record sys_id and parent table name
            var parentRecord = this._getFieldValue(queryGr, parentLevels[i]);
            var tableName = this._getFieldValue(queryGr, tableNameCol);
            if (!gs.nil(parentRecord) && !gs.nil(tableName))
                if (this._getFieldValue(queryGr, subjectPersonAccess) == 1 || parentLevels[i] == 'parent')
                    return parentRecord;
        }

        return "";
    },

    // tasks tie back to runtime Journey record
    _getJourneyRecord: function(field, id) {
        var jnyGr = new GlideRecord('sn_jny_journey');
        jnyGr.addQuery(field, id);
        jnyGr.setLimit(1);
        jnyGr.query();
        if (jnyGr.next())
            return jnyGr;
        return null;
    },

    // get the todo fields record details for the todo record
    _getRowRecordDetails: function(isDetailRow, recordGr, rowColumns, returnAsArray) {
        if (this._journeyActive && recordGr.source_table == 'sn_ja_plan_config_aux') {
            var gr = new GlideRecord(recordGr.source_table);
            if (gr.get(recordGr.document_id))
                return gr.getDisplayValue('plan_configuration');
        }
        else if (this._opmActive && recordGr.source_table == 'sn_opp_market_opportunity') {
            var oppGr = new GlideRecord(recordGr.source_table);
            if (oppGr.get(recordGr.document_id))
                return oppGr.getDisplayValue('title');
        }
        var rowValueList = [];
        var rowColList = rowColumns.split(',');
        for (var i = 0; i < rowColList.length; i++)
            rowValueList.push(this._getFieldDisplayValue(recordGr, rowColList[i]));
        return returnAsArray ? rowValueList : rowValueList.join(' - ');
    },

    // calculate due date value from today
    _getDueDays: function(dueDate) {
        var due_date = new GlideDateTime(dueDate);
        var gdTaskDueDate = due_date.getLocalDate();
        var gdLocal = new GlideDateTime().getLocalDate();
        return GlideDate.subtract(gdLocal, gdTaskDueDate).getDayPart();
    },


    // get the value of the todos_config_display_with_priority property
    _getTodoDisplayPropertyValue: function() {
        return gs.getProperty('sn_hr_sp.todos_config_display_with_priority', false);
    },

    /*
     * for each todo configuration record get the table, conditions and display values
     * To-dos need to cache these information to avoid GlideRecord calls
     */
    getTodoQueryInfo: function(includeDisplayDetails, tab) {
        return this._getTodoQueryInfo(includeDisplayDetails, tab);
    },

    /*
     * for each todo configuration record get the table, conditions and display values
     * To-dos need to cache these information to avoid GlideRecord calls
     * @input
     * *includeDisplayDetails : boolean to include display details
     * *tab : tab name filter
     * *showApprovalsOnly : optional boolean - if true, only fetch sysapproval_approver table configs
     */
    _getTodoQueryInfo: function(includeDisplayDetails, tab, showApprovalsOnly) {
        var todoConfigList = [];
        var cacheKey = 'todoConfig_'.concat(gs.getSession().getLanguage());
        if (tab) {
            cacheKey = cacheKey.concat('_').concat(tab);
        }
        // Don't use cache if showApprovalsOnly is true to ensure accurate filtering
        var useCache = !showApprovalsOnly;
        var todoConfigsFromCache = useCache ? sn_scoped_cache.ScopedCacheManager.get(todoPageUtils.EMPLOYEE_CENTER_CORE_CACHE, cacheKey) : null;

        if (todoConfigsFromCache) {
            todoConfigList = JSON.parse(todoConfigsFromCache)[cacheKey];
        } else {
            var todoConfigGr = this._getTodoConfigGr(tab);
            // Add filter for approvals only if parameter is set to true
            if (showApprovalsOnly === true) {
                todoConfigGr.addQuery("table", "sysapproval_approver");
            }
            todoConfigGr.query();
            while (todoConfigGr.next()) {
                var todoConfigRecord = {};
                todoConfigRecord.table = todoConfigGr.table.toString();
                todoConfigRecord.tab = todoConfigGr.tab.toString();
                todoConfigRecord.condition = todoConfigGr.condition.toString();
                todoConfigRecord.displayRowDetailsJson = this._getDisplayRowDetails(todoConfigGr);
                todoConfigRecord.todoConfigurationSysId = todoConfigGr.getUniqueValue();
                todoConfigList.push(todoConfigRecord);
            }
            // Only cache if not filtering by approvals only
            if (useCache) {
                var todoConfigsToBeCached = {};
                todoConfigsToBeCached[cacheKey] = todoConfigList;
                sn_scoped_cache.ScopedCacheManager.put(todoPageUtils.EMPLOYEE_CENTER_CORE_CACHE, cacheKey, JSON.stringify(todoConfigsToBeCached));
            }
        }

        // Filter for approvals only if using cached data
        if (showApprovalsOnly === true && todoConfigsFromCache) {
            todoConfigList = todoConfigList.filter(function(config) {
                return config.table === "sysapproval_approver";
            });
        }

        if (includeDisplayDetails) {
            for (var i = 0; i < todoConfigList.length; i++) {
                todoConfigList[i].widgetMappings = this._getWidgetMappings(todoConfigList[i].todoConfigurationSysId);
                todoConfigList[i].taskConfigurations = this._getTaskConfigurations(todoConfigList[i].todoConfigurationSysId);
            }
        }
        return todoConfigList;
    },
    /*
     * Fetch the todo configuration based on the filters passed.
     */
    getTodoQueryInfoByfilters: function(includeDisplayDetails, filters, params, tab) {
        return this._getTodoQueryInfoByfilters(includeDisplayDetails, filters, params, tab);
    },

    /*
     * Fetch the todo configuration based on the filters passed.
     * @input
     * *includeDisplayDetails : boolean to include display details
     * *filters : filters to apply
     * *params : additional parameters
     * *tab : tab name filter
     * *showApprovalsOnly : optional boolean - if true, only fetch sysapproval_approver table configs
     */
    _getTodoQueryInfoByfilters: function(includeDisplayDetails, filters, params, tab, showApprovalsOnly) {
        var todoConfigList = [];
        var todoFilterConditionMappingGr = new GlideRecord("sn_hr_sp_todo_filter_m2m_condition");
        todoFilterConditionMappingGr.addQuery("todo_filter", "IN", filters);
        todoFilterConditionMappingGr.addQuery("todo_filter.active", true);
        todoFilterConditionMappingGr.addQuery("todos_filter_condition.active", true);
        todoFilterConditionMappingGr.addQuery("todos_filter_condition.todo_config.active", true);
        if (tab) {
            todoFilterConditionMappingGr.addQuery("todos_filter_condition.todo_config.tab", tab);
        }
        // Add filter for approvals only if parameter is set to true
        if (showApprovalsOnly === true) {
            todoFilterConditionMappingGr.addQuery("todos_filter_condition.todo_config.table", "sysapproval_approver");
        }
        todoFilterConditionMappingGr.orderBy("todos_filter_condition.todo_config.display_priority");
        todoFilterConditionMappingGr.query();
        while (todoFilterConditionMappingGr.next()) {
            var currentTodoFilterCondition = this._fetchTodoFilterCondition(todoFilterConditionMappingGr, params);
            var todoConfigRecord = {};
            todoConfigRecord.todoFilterCondSysId = todoFilterConditionMappingGr.todos_filter_condition.sys_id;
            todoConfigRecord.table = todoFilterConditionMappingGr.todos_filter_condition.todo_config.table.toString();
            todoConfigRecord.tab = todoFilterConditionMappingGr.todos_filter_condition.todo_config.tab.toString();
            todoConfigRecord.condition = todoFilterConditionMappingGr.todos_filter_condition.todo_config.condition.toString();
            todoConfigRecord.filterCondition = currentTodoFilterCondition || "";
            if (includeDisplayDetails) {
                todoConfigRecord.displayRowDetailsJson = this._getDisplayRowDetails(todoFilterConditionMappingGr.todos_filter_condition.todo_config.getRefRecord());
                todoConfigRecord.todoConfigurationSysId = todoFilterConditionMappingGr.todos_filter_condition.todo_config.toString();
                todoConfigRecord.widgetMappings = this._getWidgetMappings(todoFilterConditionMappingGr.todos_filter_condition.todo_config.toString());
                todoConfigRecord.taskConfigurations = this._getTaskConfigurations(todoFilterConditionMappingGr.todos_filter_condition.todo_config.toString());
            }
            todoConfigList.push(todoConfigRecord);
        }
        this._processToDoFilterconditions(todoConfigList);
        return todoConfigList;

    },
    //Splitiig todo config conditions by NQ and merging todo filter condtions using and operator.
    _processToDoFilterconditions: function(todoConfigList) {
        for (var i = 0; i < todoConfigList.length; i++) {
            var currentTodoConfig = todoConfigList[i];
            var todoConfigConditions = currentTodoConfig.condition.replaceAll("^EQ", "").split('^NQ');
            for (var j = 0; j < todoConfigConditions.length; j++)
                todoConfigConditions[j] = currentTodoConfig.filterCondition ? todoConfigConditions[j] + "^" + currentTodoConfig.filterCondition : todoConfigConditions[j];

            currentTodoConfig.condition = todoConfigConditions.join("^NQ");
            delete currentTodoConfig.filterCondition;
        }
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

    // set the display row details JSON
    _getDisplayRowDetails: function(todoConfigGr) {
        var displayRowDetails = {
            titleRow: {
                titleType: todoConfigGr.title_type.toString(),
                titleField: todoConfigGr.title_field.toString(),
                customTitle: todoConfigGr.getDisplayValue('custom_title')
            },
            detailRow: {
                detailType: todoConfigGr.detail_type.toString(),
                customDetail: todoConfigGr.getDisplayValue('custom_detail'),
                detailFields: todoConfigGr.detail_fields.toString(),
                parentTable: todoConfigGr.parent_table.toString(),
                parentFields: todoConfigGr.parent_fields.toString(),
                linkToTask: todoConfigGr.link_to_task.toString() == "true" ? true : false,
                linkToParent: todoConfigGr.link_to_parent.toString() == "true" ? true : false,

            }
        };

        return displayRowDetails;
    },
    /**
     * This API validates the field existence in the given table
     */
    _checkFieldValidity: function(table, field) {
        var grTable = new GlideRecord(table);
        return grTable.isValidField(field);
    },
    // build the closure funtions for the given table and conditions
    _getClosureFunction: function(tableName, conditions, isAggregate, includeEmptyDueDateRecs, tab) {

        // add additional filters: delegation, LE adhoc tasks ...
        conditions = this._addTaskFilters(conditions);
        var isValidDueDateField = this._checkFieldValidity(tableName, 'due_date');
        if (tab === 'completed') {
            var isValidClosedAtField = this._checkFieldValidity(tableName, 'closed_at');
        }
        return function(excludes) {
            var grTask;
            grTask = new GlideRecord(tableName);
            if (isAggregate) {
                grTask.setCategory("homepage_esc_portal_task_count");
            }

            if (tableName == 'sysapproval_approver' && !(gs.getUser().hasRole('approver_user') || gs.getUser().hasRole('business_stakeholder'))) {
                var queryString = "sysapproval.sys_class_name!=sc_request^sysapproval.sys_class_name!=sc_req_item";
                var queryString2 = "sysapprovalISEMPTY";
                var conditionsSplit = conditions.split('^NQ');
                var conditionsQuery = [];
                conditionsSplit.forEach(function(condition) {
                    condition = condition.replaceAll('^EQ', '');
                    conditionsQuery.push(queryString.concat('^', condition));
                    conditionsQuery.push(queryString2.concat('^', condition));
                });
                conditions = conditionsQuery.join('^NQ');
            }

            grTask.addEncodedQuery(conditions);

            // sort by due date if column is valid and not aggregate function
            tab = tab || todoPageUtils.OPEN_TAB;
            if (!isAggregate && isValidDueDateField) {
                if (includeEmptyDueDateRecs)
                    grTask.addNullQuery('due_date');
                else
                    grTask.addNotNullQuery('due_date');

                if (tab === 'completed') {
                    var closedAt = isValidClosedAtField ? 'closed_at' : 'sys_updated_on';
                    grTask.orderByDesc(closedAt);
                } else {
                    var sortField = includeEmptyDueDateRecs ? 'sys_created_on' : 'due_date';
                    grTask.orderBy(sortField);
                }
                grTask.orderBy('number');
            }

            // exclude the list of todos that was already displayed, used for pagination
            if (excludes && excludes.length > 0)
                grTask.addQuery('sys_id', 'NOT IN', excludes);

            return grTask;
        };

    },

    // GlideRecord object for todo configurations
    _getTodoConfigGr: function(tab) {
        var todoConfigGr = new GlideRecord(todoPageUtils.TABLE_TODOS_CONFIG);
        todoConfigGr.addActiveQuery();
        if (tab)
            todoConfigGr.addQuery('tab', tab);
        todoConfigGr.orderBy('display_priority');
        return todoConfigGr;
    },

    /*
     * for each todo configuration get the coresponding widget mapping
     * To-do need to cache these information to avoid GlideRecord calls
     */
    _getWidgetMappings: function(todoConfigSysId) {
        var widgetMappings = [];
        if (!gs.nil(todoConfigSysId)) {
            var todosWidgetMappingGr = new GlideRecord(todoPageUtils.TABLE_TODOS_WIDGET_MAPPING);
            todosWidgetMappingGr.addQuery('to_dos_configuration', todoConfigSysId);
            todosWidgetMappingGr.addActiveQuery();
            todosWidgetMappingGr.query();
            while (todosWidgetMappingGr.next()) {
                var widgetMapping = {};
                widgetMapping.condition = todosWidgetMappingGr.condition.toString();
                widgetMapping.widgetSysId = todosWidgetMappingGr.widget.toString();
                widgetMapping.widgetId = todosWidgetMappingGr.widget.id.toString();
                if (todosWidgetMappingGr.now_assist_topic_block) {
                    widgetMapping.llmTopicBlock = todosWidgetMappingGr.now_assist_topic_block.name.toString();
                }

                widgetMappings.push(widgetMapping);
            }
        }
        return widgetMappings;
    },

    scPostProcessing: function(taskId, scChildId){
        var hrtt = new hr_TaskTicket();
        return hrtt.scPostProcessing(taskId, scChildId);
    },

    /*
     * for each todo configuration get the corresponding task configurations
     * To-do need to cache these information to avoid GlideRecord calls
     */
    _getTaskConfigurations: function(todoConfigSysId) {
        var taskConfigurations = [];
        if (!gs.nil(todoConfigSysId)) {
            var todosTaskConfigurationGr = new GlideRecord('sn_ex_sp_task_configuration');
            todosTaskConfigurationGr.addQuery('to_do_configuration', todoConfigSysId);
            todosTaskConfigurationGr.addActiveQuery();
            todosTaskConfigurationGr.orderByDesc('sys_created_on');
            todosTaskConfigurationGr.query();
            while (todosTaskConfigurationGr.next()) {
                var taskConfiguration = {};
                taskConfiguration.sysId = todosTaskConfigurationGr.getUniqueValue();
                taskConfiguration.table = todosTaskConfigurationGr.table.toString();
                if (!gs.nil(todosTaskConfigurationGr.additional_conditions)) {
                    taskConfiguration.additional_conditions = todosTaskConfigurationGr.additional_conditions.toString();
                }
                if (!gs.nil(todosTaskConfigurationGr.reference_column)) {
                    taskConfiguration.reference_column = todosTaskConfigurationGr.reference_column.toString();
                    taskConfiguration.reference_table = todosTaskConfigurationGr.reference_table.toString();
                    if (!gs.nil(todosTaskConfigurationGr.reference_conditions)) {
                        taskConfiguration.reference_conditions = todosTaskConfigurationGr.reference_conditions.toString();
                    }
                }
                taskConfigurations.push(taskConfiguration);
            }
        }
        return taskConfigurations;
    },

    getTaskConfiguration: function(todoConfigSysId, taskRecGr) {
        var taskConfigurations = this._getTaskConfigurations(todoConfigSysId);
        return this._getTaskConfigurationSysId(taskConfigurations, taskRecGr);
    },

    getTodoGR: function(tableName, sysId) {
        var todoLineGr = new GlideRecord(tableName);
        todoLineGr.get(sysId);

        return todoLineGr;
    },

    /* Gets details of a given to-do. These details will be used to show on the header
    @param : string - table name - table associated with to-dos configurations
    @param : string - sys id of the record from the given table
    @output: JSON  - stores - todo number, widget id, due date, url and url label etc
    */
    getTodoDetails: function(tableName, sysId, todoSysId) {
        var todoLineGr = new GlideRecord(tableName);
        // Get to-do config record
        var todoConfigGr = this.getTodoConfigForTable(tableName, todoSysId);
        var output = {};
        var isConfigAvailable = todoConfigGr.next();
        if (todoLineGr.get(sysId)) {
            if (isConfigAvailable) {
                var todoConfigRecord = {};
                // Pull config details
                todoConfigRecord = this._getConfigurationList(todoConfigGr);

                // Find associated widget for that to-do
                var todoWidgetId = this.getTodoLineWidgetID(todoConfigRecord.widgetMappings, todoLineGr);
                output.todoWidgetId = todoWidgetId;
            }
            // due-date
            var dueDateDisplayValue = gs.getMessage('No due date');
            var isValidDueDateField = this._checkFieldValidity(todoLineGr.getTableName(), 'due_date');
            if (isValidDueDateField)
                dueDateDisplayValue = new sn_hr_sp.todoPageUtils()._getDueDateTextValue(todoLineGr.getValue('due_date') + '');
            output.dueDateDisplayValue = dueDateDisplayValue;

            // Get isCompleted
            // If todo config sysId is present use todoConfigGr.tab else get using the todo state
            if (todoSysId) {
                output.isCompleted = false;
                if (todoConfigGr.tab == todoPageUtils.COMPLETED_TAB)
                    output.isCompleted = true;
            } else
                output.isCompleted = this.isTerminalState(todoLineGr);

            // Get state Label
            output.stateLabel = this.getStateLabel(todoLineGr);

            // Get title, url and todo number
            var displayValueList = [];
            // For approval request
            if (tableName == 'sysapproval_approver' && !gs.nil(todoLineGr.sysapproval)) {
                output.todoNumber = todoLineGr.getDisplayValue('sysapproval');
                if (isConfigAvailable) {
                    var displayRowJson = {};
                    displayRowJson = this._getDisplayRowDetails(todoConfigGr);
                    displayValueList.push(this._getTitleRowDisplayValue(displayRowJson, todoLineGr)); //title
                    // url and its label (associated to case)
                    displayValueList.push(this._getDetailRowDisplayValue(displayRowJson, todoLineGr, true));
                    output.url = this._getTaskUrl(displayRowJson, todoLineGr, true, tableName);
                    output.displayValueList = displayValueList;
                }
            } else {
                if (!gs.nil(todoLineGr.number))
                    output.todoNumber = todoLineGr.getValue('number'); // HC number
                if (isConfigAvailable) {
                    var displayRowJson = {};
                    displayRowJson = this._getDisplayRowDetails(todoConfigGr);
                    displayValueList.push(this._getTitleRowDisplayValue(displayRowJson, todoLineGr)); //title
                    // url and its label (associated to case)
                    displayValueList.push(this._getDetailRowDisplayValue(displayRowJson, todoLineGr, false));
                    output.url = this._getTaskUrl(displayRowJson, todoLineGr, false, tableName);
                    output.displayValueList = displayValueList;
                }
            }
        }
        return output;
    },

    getTodoConfigForTable: function(tableName, todoSysId) {
        var todoConfigGr = new GlideRecord(todoPageUtils.TABLE_TODOS_CONFIG);
        todoConfigGr.addQuery('table', tableName);
        if (todoSysId)
            todoConfigGr.addQuery('sys_id', todoSysId);
        todoConfigGr.setLimit(1);
        todoConfigGr.query();
        return todoConfigGr;
    },

    /*
     * To get matching todos config glide record for a task
     * (for Journey Bulk Task Management purpose only)
     * @input
     * *taskGR : current task GlideRecord,
     * *tableName : table of the task
     * *todoSysId (optional) : sysId of specific todo config
     * @output todo configuration GlideRecord
     */
    getTodoConfigForTask: function(taskGr, tableName, todoSysId) {
        var todoConfigGr = new GlideRecord(todoPageUtils.TABLE_TODOS_CONFIG);
        todoConfigGr.addQuery('table', tableName);
        if (todoSysId)
            todoConfigGr.addQuery('sys_id', todoSysId);
        todoConfigGr.query();
        while (todoConfigGr.next()) {
            if (GlideFilter.checkRecord(taskGr, todoConfigGr.condition))
                return todoConfigGr;
            if(this._delegationActive) {
                conditions = todoConfigGr.condition.replace(/assigned_toDYNAMIC([a-f0-9]{32})\^(?!OR)/, '');
                var isAssignedOrDelegated = new sn_hr_core.hr_Delegation().isAssignedOrDelegated(taskGr, gs.getUserID());
                if (isAssignedOrDelegated && GlideFilter.checkRecord(taskGr, conditions)) 
                    return todoConfigGr;
            }
        }
        return null;
    },

    getTodoLineWidgetID: function(widgetMappings, recordGr) {
        for (var i = 0; i < widgetMappings.length; i++) {
            if (!widgetMappings[i].condition)
                return widgetMappings[i].widgetId;
            var resBoolValue = GlideFilter.checkRecord(recordGr, widgetMappings[i].condition);
            if (resBoolValue)
                return widgetMappings[i].widgetId;
        }
        return "default-todo-line-item-widget";
    },

    _getRecordType: function(gr) {
        var tables = new global.GlideTableHierarchy(gr.sys_class_name).getTables();
        for (var i = 0; i < tables.length; i++) {
            if (tables[i] == sn_hr_core.hr.TABLE_CASE)
                return 'HR_CASE';
        }
        return 'HR_TASK';
    },

    /* Generate a URL link for a given to-do in HRM To-do page
    @param : GlideRecord
    @output : string - url
    */
    getTodoURL: function(gr) {
        if (gs.nil(gr))
            return null;

        var portalSuffix = new sn_hr_sp.hr_TicketPageConfigUtil().getActivePortalURLSuffix();
        var type = this._getRecordType(gr);
        if (type == 'HR_CASE')
            return gs.getProperty("glide.servlet.uri") + portalSuffix + '?sys_id=' + gr.sys_id + '&view=sp&id=' + new sn_hr_sp.hr_PortalUtil().ticketPage() + '&table=' + sn_hr_core.hr.TABLE_CASE + '&sysparm_url=true';

        return gs.getProperty("glide.servlet.uri") + portalSuffix + '?id=' + new sn_hr_sp.todoPageUtils().getTodoPageId() + '&view=sp&sysparm_tableName=' + gr.getTableName() + '&sys_id=' + gr.sys_id;
    },

    // Get all the users whom he/she is delegate including the passed in userId
    getApprovals: function(userId) {

        var answer = new Array();
        var i = 0;
        answer[i++] = new String(userId);
        var g = new GlideRecord("sys_user_delegate");
        g.addQuery("delegate", userId);
        g.addQuery("approvals", "true");
        g.addQuery("starts", "<=", gs.daysAgo(0));
        g.addQuery("ends", ">=", gs.daysAgo(0));
        g.query();
        while (g.next())
            answer[i++] = new String(g.user);

        return answer;
    },
    /*
     * To get the count of todos based on todo configurations
     * Will fetch the count till specific limit
     * @output to-do count 
     */
    getOpenTodoCount: function(todoCountLimit) {
        var todoCount = 0;
        var todoConfigList = this._getTodoQueryInfo(false, todoPageUtils.OPEN_TAB);

        for (var i = 0; i < todoConfigList.length && todoCount <= todoCountLimit; i++) {
            var todoConfigRecord = todoConfigList[i];
            var todoQuery = this._getClosureFunction(todoConfigRecord.table, todoConfigRecord.condition, true)();
            todoQuery.query();
            while (todoQuery.next() && (!todoCountLimit || todoCount < todoPageUtils.LIMIT_TODOS_FETCH)) {
                if (todoQuery.canRead()) {
                    todoCount++;
                }
            }
        }
        return todoCount;
    },
    // construct to do detail list while reading to do child table configuration
    _constructTodoDetailList: function(todoConfigList, limit) {
        var unSortedTodos = [];
        var queryStatus = this._initializeQueryStatus(todoConfigList, limit, [], false);

        unSortedTodos = this._getAllTodosDetail(queryStatus);
        // if the list length is more than 1 then sort else return the list
        if (unSortedTodos.length > 1)
            unSortedTodos.sort(this._sortByDueDateFunction);

        var sortedTodos = unSortedTodos.slice(0, limit);

        // if the sorted todos is less the slotsToFill then get todos with empty due dates
        if (sortedTodos.length < limit) {
            var unfilledDueDateTodos = this._getUnfilledDueDateRecord(todoConfigList, (limit - sortedTodos.length));
            sortedTodos = sortedTodos.concat(unfilledDueDateTodos);
        }
        sortedTodos = this._getBadgingDetails(sortedTodos);

        return sortedTodos;
    },
    // returns todos parent and child detail list with or without limit
    _getAllTodosDetail: function(queryStatus, recLimit) {
        var unSortedTodos = [];
        for (var index = 0; index < queryStatus.length; index++) {
            var currentQueryStat = queryStatus[index];
            var todoGr = currentQueryStat.queryGr;
            var isChildConfigPresent = this._checkChildConfigPresent(currentQueryStat.todoConfigurationSysId);
            if (isChildConfigPresent) {
                var childTableConfigObject = this._getChildTableConfiguration(currentQueryStat.todoConfigurationSysId);
                var currentTodoDetails = this._getCurrentTodoChildDetails(todoGr, childTableConfigObject, currentQueryStat, recLimit);
                unSortedTodos = unSortedTodos.concat(currentTodoDetails);
            } else {
                var currentParentTodoDetail = this._getCurrentTodoConfigDetail(todoGr, currentQueryStat, recLimit);
                unSortedTodos = unSortedTodos.concat(currentParentTodoDetail);
            }
        }
        return unSortedTodos;
    },
    // returns true/false if child configuration present for to-do or not
    _checkChildConfigPresent: function(todoSysId) {
        var cGr = new GlideRecord('sn_ex_sp_todo_config_detail');
        cGr.addQuery("todo_config", todoSysId);
        cGr.query();
        if (cGr.next()) {
            return true;
        }
        return false;
    },
    // returns child table configuration for to-do
    _getChildTableConfiguration: function(todoSysId) {
        var childConfig = {};
        var todoDetailGr = new GlideRecord('sn_ex_sp_todo_config_detail');
        todoDetailGr.addQuery("todo_config", todoSysId);
        todoDetailGr.addActiveQuery();
        todoDetailGr.orderBy('order');
        todoDetailGr.query();
        while (todoDetailGr.next()) {
            var todoDetail = {};
            var condition = todoDetailGr.getValue('conditions').toString();
            todoDetail.sourceTable = todoDetailGr.getValue('source_table').toString();
            todoDetail.commonColumn = todoDetailGr.getValue('todo_target');
            todoDetail.image = todoDetailGr.getValue('image');
            todoDetail.title = todoDetailGr.getValue('title');
            todoDetail.description = todoDetailGr.getValue('description');
            todoDetail.field1 = todoDetailGr.getValue('field_1');
            todoDetail.field2 = todoDetailGr.getValue('field_2');
            todoDetail.approvalGroup = todoDetailGr.getValue('action_group_record');
            childConfig[condition] = todoDetail;
        }
        return childConfig;
    },
    // returns to-do field values details for child table configuration
    _getCurrentTodoChildDetails: function(todoGr, childTableConfigObject, queryStatus, limit) {
        var currentTodo = [];
        var currentTodoObj;
        var counter = 0;
        while (todoGr.next() && (!limit || limit > counter)) {
            if (!todoGr.canRead())
                continue;
            counter = counter + 1;
            var conditionMatched = false;
            for (var conditionKey in childTableConfigObject) {
                if (GlideFilter.checkRecord(todoGr, conditionKey)) {
                    conditionMatched = true;
                    var commonParentColumn = childTableConfigObject[conditionKey].commonColumn;
                    var childTableSysId = todoGr.getValue(commonParentColumn);
                    currentTodoObj = this._getDetailFields(childTableSysId, childTableConfigObject[conditionKey]);
                    if (childTableConfigObject[conditionKey].approvalGroup)
                        currentTodoObj.actionsWidgetDetail = this._getTodoActionDetails(childTableConfigObject[conditionKey].approvalGroup, todoGr);
                    // due date appending
                    var isValidDueDateField = this._checkFieldValidity(todoGr.getTableName(), 'due_date');
                    currentTodoObj.due_date = isValidDueDateField ? todoGr.getValue('due_date') : "";
                    var isValidCreatedOnField = this._checkFieldValidity(todoGr.getTableName(), 'sys_created_on');
                    currentTodoObj.createdOn = isValidCreatedOnField ? todoGr.getValue('sys_created_on') : "";
                    currentTodoObj.todoConfigSysId = queryStatus.todoConfigurationSysId;
                    // url will corresponds to parent level
                    currentTodoObj.itemUrl = this._getTodosPageUrl(todoGr);
                    currentTodoObj.target = "";
                    currentTodo.push(currentTodoObj);
                    break;
                }
            }
            if (!conditionMatched) {
                // Need to check if condition did not match and map to parent fields
                currentTodoObj = this._getParentTodoRecordInfo(todoGr, queryStatus);
                currentTodo.push(currentTodoObj);
            }
        }
        return currentTodo;
    },
    _getTodoActionDetails: function(actionGrpSysId, parentTodoGr) {
        var actionsWidgetDetail = {};
        actionsWidgetDetail.parentTable = parentTodoGr.getRecordClassName();
        actionsWidgetDetail.parentRecordSysId = parentTodoGr.sys_id.toString();
        actionsWidgetDetail.actionGrpSysId = actionGrpSysId;
        return actionsWidgetDetail;
    },
    // returns parent to-do field details if child config is not there
    _getCurrentTodoConfigDetail: function(todoGr, queryStatus, limit) {
        var currentTodo = [];
        var currentTodoObj;
        var counter = 0;
        while (todoGr.next() && (!limit || limit > counter)) {
            if (!todoGr.canRead())
                continue;
            counter = counter + 1;
            currentTodoObj = this._getParentTodoRecordInfo(todoGr, queryStatus);
            currentTodo.push(currentTodoObj);
        }
        return currentTodo;
    },
    // returns the values for the mapped fields for configured table in to-do task
    _getDetailFields: function(childTableSysId, todoDetail) {
        var listViewJson = {};
        var todoChildGr = new GlideRecord(todoDetail.sourceTable);
        todoChildGr.addQuery("sys_id", childTableSysId);
        todoChildGr.query();
        while (todoChildGr.next()) {
            listViewJson.image = todoDetail.image ? this._getFormattedFieldValue(todoChildGr, todoDetail.image) : "";
            listViewJson.title = this._getFormattedFieldValue(todoChildGr, todoDetail.title);
            listViewJson.description = todoDetail.description ? this._getFormattedFieldValue(todoChildGr, todoDetail.description) : "";
            listViewJson.field1Label = todoDetail.field1 ? todoChildGr.getElement(todoDetail.field1).getLabel() : "";
            listViewJson.field1Value = todoDetail.field1 ? this._getFormattedFieldValue(todoChildGr, todoDetail.field1) : "";
            listViewJson.field2Label = todoDetail.field2 ? todoChildGr.getElement(todoDetail.field2).getLabel() : "";
            listViewJson.field2Value = todoDetail.field2 ? this._getFormattedFieldValue(todoChildGr, todoDetail.field2) : "";

            if (todoDetail.sourceTable === todoPageUtils.TABLE_SC_REQUEST_ITEM) {
                this._checkPriceFields(listViewJson, todoChildGr);
            }
        }
        return listViewJson;
    },

    /**
     * Checks for price fields in sc_request_item table and formats the price value
     * @param {Object} result updates the result.field1Value and result.field2Value
     * @param {GlideRecord} reqItemGr RITM record 
     */
    _checkPriceFields: function(result, reqItemGr) {
        if (!reqItemGr.isValidRecord())
            return;

        var priceLabel = reqItemGr.price.getLabel();
        var recurringPriceLabel = reqItemGr.recurring_price.getLabel();

        if (result.field1Label === priceLabel || result.field1Label === recurringPriceLabel) {
            var field1 = result.field1Label === priceLabel ? 'price' : 'recurring_price';
            result.field1Value = this._getPriceValue(field1, result.field1Value, reqItemGr);
        }

        if (result.field2Label === priceLabel || result.field2Label === recurringPriceLabel) {
            var field2 = result.field2Label === priceLabel ? 'price' : 'recurring_price';
            result.field2Value = this._getPriceValue(field2, result.field2Value, reqItemGr);
        }
    },

    /**
     * The price value based on service catalog item configurations
     * @param {string} field 
     * @param {string} formattedPrice formatted price string
     * @param {GlideRecord} reqItemGr 
     * @output {string} formatted price string 
     */
    _getPriceValue: function(fieldName, formattedPrice, reqItemGr) {
        var catItemGr = reqItemGr.cat_item.getRefRecord();
        if (!formattedPrice || !catItemGr.isValidRecord())
            return "";

        if (fieldName === 'recurring_price' && gs.nil(reqItemGr.recurring_frequency))
            return "";

        var itemJS = new sn_sc.CatItem(catItemGr.getUniqueValue());
        // Check if the price should be displayed for the given record class
        var cannotShowPriceClasses = gs.getProperty('glide.sc.item.cannot_show_price', '').split(',');
        var cannotShowPrice = cannotShowPriceClasses.indexOf(itemJS.getRecordClass()) > -1;
        // Individual catalog item having omit price property enabled
        var omitPriceEnabledForItem = itemJS.read({
            'omit_price': ''
        }).omit_price === 'true';
        if (cannotShowPrice || omitPriceEnabledForItem)
            return "";

        var price = parseFloat(formattedPrice.substring(1));
        if (isNaN(price))
            return "";

        // honor the glide.sc.price.display property
        var displayProperty = gs.getProperty('glide.sc.price.display', 'always');
        return (displayProperty === "non_zero" && price <= 0) || displayProperty === "never" ? "" : formattedPrice;
    },

    // returns the values for the parent to-do columns, Only title and first three fields will be mapped to the card
    _getParentTodoRecordInfo: function(todoGr, queryStatus) {

        if (todoGr.getRecordClassName() === "sn_cd_task" && todoGr.getElement("content_todo.active").toString() !== "true")
            return null;

        var todoRecordData = {};

        todoRecordData.sysId = todoGr.getUniqueValue();

        todoRecordData.tableName = todoGr.getTableName();
        todoRecordData.isApprovalTable = todoRecordData.tableName == 'sysapproval_approver' ? true : false;
        var displayRowJson = queryStatus.displayRowDetailsJson;

        //titleRow
        todoRecordData.title = this._getTitleRowDisplayValue(displayRowJson, todoGr);

        //detail Row
        var detailRowLabelArr = this._getDetailRowLabel(displayRowJson.detailRow, todoGr);
        var detailRowArr = this._getDetailRowValueWithFormat(displayRowJson, todoGr, todoRecordData.isApprovalTable, true);
        todoRecordData.description = detailRowArr[0] ? detailRowArr[0] : "";
        todoRecordData.field1Label = detailRowLabelArr[1] ? detailRowLabelArr[1] : "";
        todoRecordData.field1Value = detailRowArr[1] ? detailRowArr[1] : "";
        todoRecordData.field2Label = detailRowLabelArr[2] ? detailRowLabelArr[2] : "";
        todoRecordData.field2Value = detailRowArr[2] ? detailRowArr[2] : "";
        todoRecordData.todoConfigSysId = queryStatus.todoConfigurationSysId;
        // Checking for sysapproval_approver request containing sc_req_item record. 
        if (todoRecordData.isApprovalTable && !gs.nil(todoGr.sysapproval)) {
            var approvalRecord = todoGr.sysapproval.getRefRecord();
            if (approvalRecord.isValidRecord() &&
                approvalRecord.getTableName() === todoPageUtils.TABLE_SC_REQUEST_ITEM) {
                this._checkPriceFields(todoRecordData, approvalRecord);
            }
        }
        //url
        todoRecordData.itemUrl = this._getTodosPageUrl(todoGr);
        todoRecordData.target = "";
        var isValidDueDateField = this._checkFieldValidity(todoGr.getTableName(), 'due_date');
        // get the due date values
        if (isValidDueDateField) {
            todoRecordData.due_date = todoGr.getValue('due_date');
        }
        todoRecordData.createdOn = todoGr.getValue('sys_created_on');

        return todoRecordData;
    },
    // returns the todos detail if due date is not present
    _getUnfilledDueDateRecord: function(todoConfigList, remainingRecordCount) {
        var currentTodos = [];
        var queryStatus = this._initializeQueryStatus(todoConfigList, remainingRecordCount, [], true);
        currentTodos = this._getAllTodosDetail(queryStatus, remainingRecordCount);
        // if the list length is more than 1 then sort else return the list
        if (currentTodos.length > 1) {
            currentTodos.sort(this._sortByCreatedOnFunction);
        }
        return currentTodos;
    },
    // gives the badging details label and colour for activity list
    _getBadgingDetails: function(finalTodoArray) {
        for (var index = 0; index < finalTodoArray.length; index++) {
            var currentElemDueDate = finalTodoArray[index].due_date;
            var badgeBadgeColorArr = this._getDueDateForBadge(currentElemDueDate);
            finalTodoArray[index].badge = badgeBadgeColorArr[0];
            finalTodoArray[index].badgeColor = badgeBadgeColorArr[1];
            finalTodoArray[index].badgeTextColor = badgeBadgeColorArr[2];
        }
        return finalTodoArray;
    },
    // get the due date text and badge colours
    _getDueDateForBadge: function(dueDate) {
        var dueDateBadgeBadgeColor = [];
        var dueDateDisplayValue = "";
        var dueDateDisplayColor = "";
        var dueDateTextColor = "";
        if (!gs.nil(dueDate)) {
            var dueDays = this._getDueDays(dueDate + '');
            if (dueDays < 0) {
                if (dueDays === -1)
                    dueDateDisplayValue = gs.getMessage('Overdue {0} day', String(0 - dueDays));
                else
                    dueDateDisplayValue = gs.getMessage('Overdue {0} days', String(0 - dueDays));
                dueDateDisplayColor = "#FFCCD2";
            } else {
                if (dueDays < 7) {
                    if (dueDays === 0)
                        dueDateDisplayValue = gs.getMessage('Due today');
                    else if (dueDays === 1)
                        dueDateDisplayValue = gs.getMessage('Due soon in {0} day', dueDays);
                    else
                        dueDateDisplayValue = gs.getMessage('Due soon in {0} days', dueDays);

                    dueDateDisplayColor = "#FBF7BC";
                } else if (dueDays >= 7) {
                    dueDateDisplayValue = gs.getMessage('Due in {0} days', dueDays);
                    dueDateDisplayColor = "#CBE9FC";
                }
            }
        } else {
            dueDateDisplayValue = gs.getMessage('No due date');
            dueDateDisplayColor = "#CBE9FC";
        }
        dueDateTextColor = "#181A1F";
        dueDateBadgeBadgeColor[0] = dueDateDisplayValue;
        dueDateBadgeBadgeColor[1] = dueDateDisplayColor;
        dueDateBadgeBadgeColor[2] = dueDateTextColor;

        return dueDateBadgeBadgeColor;
    },
    // returns to-do config sys_id based a record it is valid for
    getTodoConfigSysId: function(recordTableName, recordSysId) {
        var todoConfigGr = new GlideRecord("sn_hr_sp_todos_config");
        todoConfigGr.addActiveQuery();
        todoConfigGr.addQuery('table', recordTableName);
        todoConfigGr.query();
        while (todoConfigGr.next()) {
            var recordGr = new GlideRecord(recordTableName);
            recordGr.addQuery('sys_id', recordSysId);
            if (recordTableName == 'sysapproval_approver') {
                if (!(gs.getUser().hasRole('approver_user') || gs.getUser().hasRole('business_stakeholder'))) {
                    var queryString = "sysapproval.sys_class_name!=sc_request^sysapproval.sys_class_name!=sc_req_item^NQsysapprovalISEMPTY";
                    recordGr.addEncodedQuery(queryString);
                }
            }
            recordGr.addEncodedQuery(todoConfigGr.condition);
            recordGr.query();
            if (recordGr.next()) {
                return todoConfigGr.getUniqueValue();
            }
        }
        return;
    },
    // returns single to do page url
    _getSingleTodoUrl: function(gr, todoConfigSysId) {
        if (gs.nil(gr))
            return null;
        return '?id=' + this.getTodoPageId() + '&view=sp&sysparm_tableName=' + gr.getTableName() + '&sys_id=' + gr.sys_id + '&todo_sys_id=' + todoConfigSysId;
    },
    // returns todos page url
    _getTodosPageUrl: function(gr) {
        if (gs.nil(gr))
            return null;

        return '?id=' + this.getAllTodoPageId() + '&todo=' + gr.sys_id;
    },
    // returns the field display value
    _getFormattedFieldValue: function(gr, column) {
        var colElement = gr.getElement(column);
        var colType = colElement.getED().getInternalType();
        var displayValue = colElement.getDisplayValue();
        if ((colType === 'currency' || colType === 'price') && displayValue) {
            return this._getFormattedData(displayValue, colElement);
        } else if (colType === 'translated_html' && displayValue) {
            return $sp ? $sp.stripHTML(displayValue) : displayValue;
        }
        return displayValue;
    },
    //returns formatted value up to two decimal places for currency and Price data type
    _getFormattedData: function(value, element) {
        var formattedValue = "";
        var valueLong = parseFloat(element).toFixed(2);
        var firstDigitIndex = value.search(/\d+/);
        if (firstDigitIndex > 0) {
            var currencyCode = value.substr(0, firstDigitIndex);
            formattedValue = '' + currencyCode + valueLong;
        } else {
            var currencyIndex = value.search((/\D*$/));
            currencyCode = value.substr(currencyIndex, value.length - 1);
            formattedValue = '' + valueLong + currencyCode;
        }
        return formattedValue;
    },
    // returns the labels for the to-do parent configuration
    _getDetailRowLabel: function(displayRowJsonValue, gr) {
        var labelArr = [];
        // return if detail fields are not mapped
        if (displayRowJsonValue.detailType === "parent_fields" && displayRowJsonValue.parentTable && displayRowJsonValue.parentFields) {
            var parentTable = displayRowJsonValue.parentTable;
            var parentFields = displayRowJsonValue.parentFields;
            var parentColList = parentFields.split(',');
            var parentGr = new GlideRecord(parentTable);
            for (var i = 0; i < parentColList.length; i++) {
                labelArr[i] = parentGr.getElement(parentColList[i]).getLabel();
            }
        } else if (displayRowJsonValue.detailFields) {
            var tableColList = displayRowJsonValue.detailFields.split(',');
            for (var i = 0; i < tableColList.length; i++) {
                labelArr[i] = gr.getElement(tableColList[i]).getLabel();
            }
        }
        return labelArr;
    },

    fetchSelectedFilters: function(filtersData) {
        var selectedFiltersList = [];

        filtersData.forEach(function(category) {
            if (category.selectedFilters.length > 0) {
                var configList = {};

                category.selectedFilters.forEach(function(filter) {
                    Object.keys(filter.configConditions).forEach(function(key, index) {
                        if (filter.configConditions[key].length > 0) {
                            configList[key] = filter.configConditions[key][0].configConfition.toString();
                        }
                    });
                });
                selectedFiltersList.push({
                    selectedFilters: category.selectedFilters,
                    configurations: configList
                });
            }
        });
        var selectedFiltersConditions = {
            applyFilters: false,
            finalFilterConditions: {}
        };

        if (!selectedFiltersList || selectedFiltersList.length == 0) {
            return selectedFiltersConditions;
        }

        var commonConfig = this.fetchSelectedFiltersWithActiveConfig(selectedFiltersList);
        selectedFiltersConditions.applyFilters = true;
        selectedFiltersConditions.finalFilterConditions = this.fetchFinalConditionsForCategories(commonConfig, selectedFiltersList);
        return selectedFiltersConditions;
    },

    fetchSelectedFiltersWithActiveConfig: function(selectedFiltersList) {
        var configList = selectedFiltersList[0].configurations;
        for (var i = 1; i < selectedFiltersList.length; i++) {
            Object.keys(configList).forEach(function(key) {
                if (!selectedFiltersList[i].configurations[key]) {
                    delete configList[key];
                }
            });
        }
        return configList;
    },

    getConditionForCategory: function(configurations, config, category) {
        var condition = '';
        var configConditionArray = configurations[config].split('^NQ');

        category.selectedFilters.forEach(function(filter) {
            if (filter.configConditions[config]) {
                filter.configConditions[config].forEach(function(filterRec) {
                    configConditionArray.forEach(function(configCondition) {
                        var filterCondition = configCondition.toString().replaceAll("^EQ", "");
                        if (filterRec.activeConfigFilterConditions.filterCondition) {
                            filterCondition = filterCondition + '^' + filterRec.activeConfigFilterConditions.filterCondition;
                        }
                        condition = condition == '' ? filterCondition : condition + '^NQ' + filterCondition;
                    });
                });
            }
        });
        return condition;
    },

    fetchFinalConditionsForCategories: function(configuration, selectedFilters) {
        var conditionList = {};
        Object.keys(configuration).forEach(function(config) {

            var todoFilterCondition = this.getConditionForCategory(configuration, config, selectedFilters[0]);
            var conditionsArray = todoFilterCondition.split('^NQ');

            for (var i = 1; i < selectedFilters.length; i++) {
                var category = selectedFilters[i];
                var categoryCondition = [];
                category.selectedFilters.forEach(function(filter) {
                    if (filter.configConditions[config]) {

                        filter.configConditions[config].forEach(function(filterRec) {
                            var tempArray = conditionsArray.slice();
                            tempArray.forEach(function(cond, index) {
                                if (filterRec.activeConfigFilterConditions.filterCondition) {
                                    tempArray[index] = cond + '^' + filterRec.activeConfigFilterConditions.filterCondition;
                                }
                            });
                            categoryCondition = categoryCondition.concat(tempArray);
                        });

                    }
                });
                conditionsArray = categoryCondition;
            }
            conditionList[config] = conditionsArray.join('^NQ');
        }, this);

        return conditionList;
    },

    /**
     * Helper method to execute todos count query which will be invoked from MangerHub application
     */
    executeTodosCountQueryForManagerHub: function(todoRecord, reporteeFields, todos) {
        var todoQuery = new GlideRecord(todoRecord.table);
        todoQuery.addEncodedQuery(todoRecord.condition);
        todoQuery.query();

        while (todoQuery.next()) {
            for (var fInd = 0; fInd < reporteeFields.length; fInd++) {
                var field = reporteeFields[fInd];
                var userSysId = todoQuery.getElement(field).toString();
                if (userSysId) {
                    if (todos[userSysId])
                        todos[userSysId] = todos[userSysId] + 1;
                    else
                        todos[userSysId] = 1;
                    break;
                }
            }
        }
    },

    getTodoGRFields: function(tableName, sysId, fields) {
        var todoGr = this.getTodoGR(tableName, sysId);
        var fieldObj = {};
        for (var i = 0; i < fields.length; i++) {
            var fieldName = fields[i];
            var fieldValue = todoGr.getValue(fieldName);
            if (fieldValue) {
                fieldObj[fieldName] = fieldValue;
            }
        }
        return fieldObj;
    },

    //This function gets ShortDescription of the parent case.
    getApprovalInfo: function(sysId) {
        var sysApprovalRecord = new GlideRecordSecure('sysapproval_approver');
        var shortDescription = "";
        if (sysApprovalRecord.get(sysId)) {
            if (!gs.nil(sysApprovalRecord.sysapproval) && !gs.nil(sysApprovalRecord.sysapproval.short_description))
                shortDescription = sysApprovalRecord.sysapproval.short_description;
            else if (!gs.nil(sysApprovalRecord.document_id))
                shortDescription = !gs.nil(sysApprovalRecord.document_id.short_description) ? (sysApprovalRecord.document_id.number + " - " + sysApprovalRecord.document_id.short_description) : sysApprovalRecord.document_id.number;
            else {
                shortDescription = !gs.nil(sysApprovalRecord.sysapproval) ? sysApprovalRecord.sysapproval.number : "";
                shortDescription = gs.getMessage("Do you want to approve the following: {0}?", shortDescription);
            }
        } else
            gs.addErrorMessage(gs.getMessage("Unexpected action occurred"));
        shortDescription = typeof shortDescription == "string" ? shortDescription : shortDescription.getDisplayValue();
        return shortDescription;
    },

    type: 'todoPageUtils'
};
