var SOWUpcomingSNC = Class.create();
SOWUpcomingSNC.prototype = {
	ACTIVE_RECORD: "active=true",
	ASSIGNED_TO_ME: "assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe",
	ON_TODAY: "ONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()",
	ON_TOMORROW: "ONTomorrow@javascript:gs.beginningOfTomorrow()@javascript:gs.endOfTomorrow()",
	TABLE: {
		CHANGE_REQUEST: "change_request",
		INCIDENT: "incident",
		SC_REQ_ITEM: "sc_req_item",
		TASK: "task"
	},

	initialize: function() {
	},

	getCounts: function() {
		this._total = {'today': 0, 'tomorrow': 0};
		this._change = this._getChangeRequestCount();
		this._task_sla_at_risk = this._getIncidentWithSLAAtRisk();
		this._task_sla_breached = this._getIncidentWithSLABreached();
		this._requested_item = this._getRequestedItems();
		this._overdue = this._getOverdueTasks();
		return {
			"change": this._change,
			"task_sla_at_risk": this._task_sla_at_risk,
			"task_sla_breached": this._task_sla_breached,
			"requested_item": this._requested_item,
			"overdue": this._overdue,
			"total": this._total
		};
	},

	/*

	- Change Requests that are due today
	- Incidents with SLA at risk
	- Incidents with breached SLA
	- Requested Items that are due today
	- Overdue tasks (requested items and change requests only)

	*/
	_getChangeRequestCount: function() {
		var encodedQueryToday = [this.ACTIVE_RECORD, this.ASSIGNED_TO_ME, this._getTodayDateQuery("start_date")].join("^");
		var encodedQueryTomorrow = [this.ACTIVE_RECORD, this.ASSIGNED_TO_ME, this._getTomorrowDateQuery("start_date")].join("^");
		var todayValue = this._getTableCount(this.TABLE.CHANGE_REQUEST, encodedQueryToday);
		var tomorrowValue = this._getTableCount(this.TABLE.CHANGE_REQUEST, encodedQueryTomorrow);
		this._addToTotal(todayValue, tomorrowValue);
		var result = {
			"label": {
				"value": gs.getMessage("change"),
				"plural": gs.getMessage("changes"),
			},
			"title": {
				"value": gs.getMessage("Change"),
				"plural": gs.getMessage("Changes"),
			},
			"today": { "value": todayValue },
			"tomorrow": { "value": tomorrowValue }
		};
		if (todayValue === 1)
			result.today.sysId = this._getRecordSysId(this.TABLE.CHANGE_REQUEST, encodedQueryToday);
		else
			result.today.encodedQuery = encodedQueryToday;
		if (tomorrowValue === 1)
			result.tomorrow.sysId = this._getRecordSysId(this.TABLE.CHANGE_REQUEST, encodedQueryTomorrow);
		else
			result.tomorrow.encodedQuery = encodedQueryTomorrow;	
		return result;
	},

	_getIncidentWithSLAAtRisk: function() {
		var encodedQueryToday = [
			this.ACTIVE_RECORD, this.ASSIGNED_TO_ME,
			"JOINincident.sys_id=task_sla.task!" + this._getTodayDateQuery("planned_end_time"),
			"JOINincident.sys_id=task_sla.task!has_breached=false"
		].join("^");
		var encodedQueryTomorrow = [
			this.ACTIVE_RECORD, this.ASSIGNED_TO_ME,
			"JOINincident.sys_id=task_sla.task!" + this._getTomorrowDateQuery("planned_end_time")
		].join("^");
		var todayValue = this._getTableCount(this.TABLE.INCIDENT, encodedQueryToday);
		var tomorrowValue = this._getTableCount(this.TABLE.INCIDENT, encodedQueryTomorrow);
		this._addToTotal(todayValue, tomorrowValue);
		var result = {
			"label": {
				"value": gs.getMessage("incident with SLA at risk"),
				"plural": gs.getMessage("incidents with SLA at risk"),
			},
			"title": {
				"value": gs.getMessage("Incident"),
				"plural": gs.getMessage("Incidents"),
			},
			"today": { "value": todayValue },
			"tomorrow": { "value": tomorrowValue }
		};
		if (todayValue === 1)
			result.today.sysId = this._getRecordSysId(this.TABLE.INCIDENT, encodedQueryToday);
		else
			result.today.encodedQuery = encodedQueryToday;
		if (tomorrowValue === 1)
			result.tomorrow.sysId = this._getRecordSysId(this.TABLE.INCIDENT, encodedQueryTomorrow);
		else
			result.tomorrow.encodedQuery = encodedQueryTomorrow;	
		return result;
	},

	// Only today's required
	_getIncidentWithSLABreached: function() {
		var encodedQuery = [this.ACTIVE_RECORD, this.ASSIGNED_TO_ME, "JOINincident.sys_id=task_sla.task!has_breached=true"].join("^");
		var incidentsCount = this._getTableCount(this.TABLE.INCIDENT, encodedQuery);
		this._addToTotal(incidentsCount, 0);
		var result = {
			"label": {
				"value": gs.getMessage("incident with breached SLA"),
				"plural": gs.getMessage("incidents with breached SLA"),
			},
			"title": {
				"value": gs.getMessage("Incident"),
				"plural": gs.getMessage("Incidents"),
			},
			"today": { "value": incidentsCount }
		};
		if (incidentsCount === 1)
			result.today.sysId = this._getRecordSysId(this.TABLE.INCIDENT, encodedQuery);
		else
			result.today.encodedQuery = encodedQuery;
		return result;
	},

	_getRequestedItems: function() {
		var encodedQueryToday = [this.ACTIVE_RECORD, this.ASSIGNED_TO_ME, this._getTodayDateQuery("due_date")].join("^");
		var encodedQueryTomorrow = [this.ACTIVE_RECORD, this.ASSIGNED_TO_ME, this._getTomorrowDateQuery("due_date")].join("^");
		var todayValue = this._getTableCount(this.TABLE.SC_REQ_ITEM, encodedQueryToday);
		var tomorrowValue = this._getTableCount(this.TABLE.SC_REQ_ITEM, encodedQueryTomorrow);
		this._addToTotal(todayValue, tomorrowValue);
		var result = {
			"label": {
				"value": gs.getMessage("requested item"),
				"plural": gs.getMessage("requested items"),
			},
			"title": {
				"value": gs.getMessage("Requested item"),
				"plural": gs.getMessage("Requested items"),
			},
			"today": { "value": todayValue },
			"tomorrow": { "value": tomorrowValue }
		};
		if (todayValue === 1)
			result.today.sysId = this._getRecordSysId(this.TABLE.SC_REQ_ITEM, encodedQueryToday);
		else
			result.today.encodedQuery = encodedQueryToday;
		if (tomorrowValue === 1)
			result.tomorrow.sysId = this._getRecordSysId(this.TABLE.SC_REQ_ITEM, encodedQueryTomorrow);
		else
			result.tomorrow.encodedQuery = encodedQueryTomorrow;	
		return result;
	},

	// Only today's required
	_getOverdueTasks: function() {
		var gdt = new GlideDateTime();
		var now = '"' +gdt.getLocalDate() + '", "' + gdt.getLocalTime().toString().split(" ")[1] + '"';
		var encodedQuery = [
			"sys_class_name=change_request",
			"OR" + "sys_class_name=sc_req_item",
			this.ACTIVE_RECORD, this.ASSIGNED_TO_ME,
			"ref_change_request.start_date<javascript:gs.dateGenerate(" + now + ")",
			"OR" + "due_date<javascript:gs.dateGenerate(" + now + ")"
		].join("^");
		var tasksCount = this._getTableCount(this.TABLE.TASK, encodedQuery);
		this._addToTotal(tasksCount, 0);
		var result = {
			"label": {
				"value": gs.getMessage("overdue task"),
				"plural": gs.getMessage("overdue tasks"),
			},
			"title": {
				"value": gs.getMessage("Overdue task"),
				"plural": gs.getMessage("Overdue tasks"),
			},
			"today": { "value": tasksCount }
		};
		if (tasksCount === 1)
			result.today.sysId = this._getRecordSysId(this.TABLE.TASK, encodedQuery);
		else
			result.today.encodedQuery = encodedQuery;
		return result;
	},

	_getTableCount: function(tableName, encodedQuery) {
		var ga = new GlideAggregate(tableName);
		ga.addEncodedQuery(encodedQuery);
		ga.addAggregate('COUNT');
		ga.query();
		var count = 0;
		if (ga.next())
			count = parseInt(ga.getAggregate('COUNT'));
		return count;
	},

	_getTodayDateQuery: function(fieldName) {
		return fieldName + this.ON_TODAY;
	},

	_getTomorrowDateQuery: function(fieldName) {
		return fieldName + this.ON_TOMORROW;
	},

	_addToTotal: function(todayValue, tomorrowValue) {
		this._total.today += todayValue;
		this._total.tomorrow += tomorrowValue;
	},

	_getRecordSysId: function(tableName, encodedQuery) {
		var gr = new GlideRecord(tableName);
		gr.addEncodedQuery(encodedQuery);
		gr.setLimit(1);
		gr.query();
		if (gr.next())
			return gr.getValue('sys_id');
		return '';
	},

	type: 'SOWUpcomingSNC'
};
