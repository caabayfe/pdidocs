(function() {
	//Check if current task is survey
	data.isTaskSurvey = false;
	var filters = $sp.getParameter('filters');
	data.todoParameter = $sp.getParameter('todo');
	data.selectedFiltersFromTodoPage = [];
	data.isLPActive = new GlidePluginManager().isActive('sn_lp');

	if (input && input.action == 'checkTaskType'){
		var gr = new GlideRecordSecure(input.table);
		if (gr.get(input.sysId) && (gr.hr_task_type == 'take_survey'|| gr.hr_task_type == 'collect_Information'))
			data.isTaskSurvey = true;
	} if(input && input.action == 'addNotification'  && data.isLPActive) {
		var pulseUtils = new sn_lp.PulseUtilsAjax();
		data.taskInfo = pulseUtils.checkForTriggeredConditions ? pulseUtils.checkForTriggeredConditions(input.table, input.taskId) : {};
	}

	// translated text
	data.i18n = {
		DELEGATED: gs.getMessage("Delegated"),
		DELEGATED_BY: gs.getMessage("Delegated by: {}")
	};

	data.isMobile = gs.isMobile();
	data.todoSummaryLeftPanel = true;
	data.todosToShow = {
			recordsToShow : {},
			recordWatchers : []
	};
	data.watchers =[];
	data.async = (input && input.onTicketPage) ? false : true;

	var util = new sn_hr_sp.todoPageUtils();
	data.tabs = util.getTabs();
 	data.defaultTab = data.tabs[0].name;
	data.queryLimit = todoPageUtils.QUERY_LIMIT;

	data.todosFilters = $sp.getWidget('todos-filters', {});

	data.txt = {
		empty: {},
		onComplete: gs.getMessage('All tasks are Complete'),
		title: gs.getMessage('My tasks'),
		breadcrumb: gs.getMessage('My tasks'),
		backToAriaLabel: gs.getMessage('Back to {0}')
	};
	data.txt.empty[data.defaultTab] = {
		title: gs.getMessage("You don't have any tasks right now.")
	};

	data.txt.empty.completed = {
		title: gs.getMessage("You don't have any completed tasks yet.")
	};

	if (input && input.action == "loadFromTicketPage") {
		data.todosToShow.recordsToShow = util.splitInTabs(new sn_hr_sp.hr_PortalUtil().processRecordsForSummary(input.recordsToShow), data.defaultTab);
		data.todosToShow.recordWatchers = input.recordWatchers;
		data.watchers = data.todosToShow.recordWatchers||[];
		data.onTodoPage = false;
		data.onTicketPage = true;
		data.parentCaseId = input.parent;
		data.activitySetName = input.activitySetName;
		data.activitySetAriaLabel = data.txt.backToAriaLabel.replace('{0}', data.activitySetName);
		data.activitySetId = input.activitySetId;
		data.selectedTodo = input.todoSelected;
		data.currentTodoIndex = (data.todosToShow.recordsToShow[data.defaultTab] && data.todosToShow.recordsToShow[data.defaultTab].length > input.currentTodoIndex) ? input.currentTodoIndex: 0;
		data.hideTodoSummary = input.hideTodoSummary;
	} else if (input && input.action == "loadTodos") {
		data.onTodoPage = true;
		data.onTicketPage = false;
		if (input.limit) {
                       data.queryLimit = input.limit;
		}
		if(input.tab){
			data.tab = input.tab;
		} else{
			data.tab = data.defaultTab;
		}
		if(input.selectedFiltersFromTodoPage){
			data.todosToShow = util.getMyTodos(data.queryLimit, [], input.includeTodo,undefined,undefined,input.selectedFiltersFromTodoPage.finalFilterConditions,input.selectedFiltersFromTodoPage.applyFilters,data.tab);
		} else{
			data.todosToShow = util.getMyTodos(data.queryLimit, [], input.includeTodo,undefined,undefined,undefined,undefined, data.tab);
		}

		data.watchers = data.todosToShow.recordWatchers||[];
	} else if (input && input.action == "loadFilteredTodos") {
		data.selectedFiltersFromTodoPage = util.fetchSelectedFilters(input.filtersData);
		data.onTodoPage = true;
		data.onTicketPage = false;
		data.todosToShow = util.getMyTodos(data.queryLimit, [], input.includeTodo,undefined,undefined,data.selectedFiltersFromTodoPage.finalFilterConditions,data.selectedFiltersFromTodoPage.applyFilters);
		data.watchers = data.todosToShow.recordWatchers||[];
	} else if (input && input.action == "insertOrUpdateTodoRecord") {
		var noOfRecords = Math.ceil(input.currentCount/data.queryLimit)*data.queryLimit;
		if(noOfRecords < (todoPageUtils.QUERY_LIMIT*2))
			noOfRecords = todoPageUtils.QUERY_LIMIT*2;
		data.onTodoPage = true;
		data.onTicketPage = false;
		data.newTodosList = util.getMyTodos(noOfRecords,undefined,undefined,undefined,undefined,data.selectedFiltersFromTodoPage);
	} else if (input && input.action == "loadMoreTodos") {
		data.todosToShow = util.getMyTodos(data.queryLimit,input.excludeList,undefined,undefined,undefined,input.selectedFiltersFromTodoPage.finalFilterConditions,input.selectedFiltersFromTodoPage.applyFilters);
	} else if (input && input.action == "loadFillerTodos"){
		data.fillerTodosList = util.getMyTodos(input.fillerCount, input.fillerExcludeList,undefined,undefined,undefined,data.selectedFiltersFromTodoPage.finalFilterConditions,data.selectedFiltersFromTodoPage.applyFilters);
	}

	Object.keys(data.todosToShow.recordsToShow).forEach(function(tab) {
		(data.todosToShow.recordsToShow[tab] || []).forEach(function(todo) {
			if (!todo.displayValueList) return;
			todo.displayValueList = todo.displayValueList.map(function (displayValue) {
				return GlideSecurityUtils.escapeScript(displayValue);
			});
		});
	});

	if (data.onTicketPage) {
		data.txt.empty[data.defaultTab].message = gs.getMessage('All tasks are Complete');
	}

})();
