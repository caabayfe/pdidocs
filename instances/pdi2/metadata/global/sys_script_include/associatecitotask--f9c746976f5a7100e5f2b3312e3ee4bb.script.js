var AssociateCIToTask = Class.create();
AssociateCIToTask.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	SESSION_KEY: 'com.snc.change_request.AssociateCIToTask.ci_user_filter',

	ajaxFunction_getURL: function(){
		var chgReqId = this.getParameter("sysparm_id");
		var addToTable = this.getParameter("sysparm_add_to") + "";
		return this._getURL(chgReqId, addToTable);
	},

	_getURL: function(chgReqId, addToTable){
		if (!new GlideRecord('task_ci').canCreate())
			return;
		this.removeUserFilter();

		var latestClassAdded;
		var parentClass = "";
		var principalClassFilter = "";
		// latestClassAdded logic
		// 1. if there are ci's, get the latest class of the ci
		// 2. default the latest class to parent class
		if (addToTable === "task_ci") {
			principalClassFilter = this.getPrincipalClassFilter(chgReqId);
			if (!principalClassFilter)
				latestClassAdded = this.getLatestClass(chgReqId);
			parentClass = this.getParentClass(chgReqId);
			if (!latestClassAdded)
				latestClassAdded = parentClass;
		}
		else if (addToTable === "task_service_offering")
			latestClassAdded = "service_offering";
		else
			latestClassAdded = "cmdb_ci";

		var url = new GlideURL("task_add_affected_cis.do");
		url.set("sysparm_crSysId", chgReqId);
		url.set("sysparm_view", "associate_ci");
		url.set("sysparm_add_to", addToTable);
		url.set("sysparm_stack", "no");
		url.set("sysparm_table", latestClassAdded);
		url.set("sysparm_parent_class", parentClass);
		url.set("sysparm_fixed_query", principalClassFilter);
		return new GlideTinyURL().createTinyURL(url);
	},

	getQueryFilter: function(chgReqId, addToTable) {
		var principalClassFilter = "";
		if (addToTable === "task_ci")
			principalClassFilter = this.getPrincipalClassFilter(chgReqId);
		return principalClassFilter;
	},

	/*
 	* If "Best Practice - Bulk CI Changes" plugin is active and task type is change_requests
 	*     parent class = ci_class populated on the change_request
 	*     if --None- is selected for ci_class, then cmdb_ci is returned
 	* else
 	*     parent class = cmdb_ci
 	**/
	getParentClass: function(chgReqId) {
		if (GlidePluginManager.isActive("com.snc.bestpractice.bulkchange") || GlidePluginManager.isActive("com.snc.change_management.mass_update_ci")) {
			var chgReqGR = new GlideRecordSecure("change_request");
			if (chgReqGR.get(chgReqId) && !chgReqGR.ci_class.nil()){
				if ((chgReqGR.isValidField("is_bulk") && chgReqGR.getValue("is_bulk") === "1") || !chgReqGR.isValidField("is_bulk")) {
					return chgReqGR.ci_class;
				}
			}
		}
		return "cmdb_ci";
	},

	getPrincipalClassFilter: function(chgReqId) {
		if (!chgReqId)
			return;
		var taskGr = new GlideRecord("task");
		taskGr.get(chgReqId);
		if (!taskGr.isValidRecord()) {
			gs.error("Invalid task record sys-id passed");
			return;
		}
		return new TaskUtils().getPCFilterEvaluated(taskGr.sys_class_name + '');
	},
	storeUserFilter: function(){
		var filter;
		filter = this.getParameter("sysparm_filter_query");
		gs.getSession().putClientData(this.SESSION_KEY, filter);
		return;
	},

	removeUserFilter: function(){
		gs.getSession().clearClientData(this.SESSION_KEY);
		return;
	},
	
	_isValidTask: function(id) {
		var gr = new GlideRecord('task');
		return gr.get(id) && gr.active;
	},

	addSelected: function() {
		var id = this.getParameter("sysparm_id");
		if(!this._isValidTask(id)){
			gs.error("Unable to Add CI item(s) for an inactive/invalid task {0}", id);
			return;
		}
		var addToTable = this.getParameter("sysparm_add_to_table") + "";
		var selCIsList = this.getParameter("sysparm_selCIs");

		if (!selCIsList)
			return;

		var affectedCI = new GlideRecord(addToTable);
		if (affectedCI.canCreate()) {
			var selCIs = selCIsList.split(",");

			var existingCI = new GlideRecord(addToTable);
			var col = this.getCIField(addToTable);
			existingCI.addQuery(col, "IN", selCIsList);
			existingCI.addQuery("task", id);
			existingCI.query();
			var addedCIs = [];
			while (existingCI.next())
				addedCIs.push(existingCI.getValue(col) + '');

			for (var i = 0; i < selCIs.length; i++) {
				if (addedCIs.indexOf(selCIs[i] + '') == -1) {
					affectedCI.initialize();
					affectedCI.task = id;
					affectedCI.setValue(col, selCIs[i]);
					affectedCI.insert();
				}
			}
		}
	},

	getLatestClass: function(chgReqId){
		var affectedCiGR = new GlideRecordSecure("task_ci");
		affectedCiGR.addQuery("task", chgReqId);
		affectedCiGR.orderByDesc("sys_updated_on");
		affectedCiGR.setLimit(1);
		affectedCiGR.query();
		if (affectedCiGR.next())
			return affectedCiGR.ci_item.sys_class_name;
		return "";
	},
	
	getCIField: function(table) {
		if ("task_ci" === table)
			return "ci_item";
		else if ("task_service_offering" === table)
			return "service_offering";
		return "cmdb_ci_service";
	},

	addAll: function() {
		var addToTable = this.getParameter("sysparm_add_to_table") + "";
		var id = this.getParameter("sysparm_id");
		if(!this._isValidTask(id)){
			gs.error("Unable to Add CI item(s) for an inactive/invalid task {0}", id);
			return;
		}
		var affectedCI = new GlideRecord(addToTable);
		if (affectedCI.canCreate()) {
			var fixedQuery = this.getParameter("sysparm_fixed_query");
			var query = this.getParameter("sysparm_query");
			var listTableName = this.getParameter("sysparm_tableName");

			var result = [];
			var existingCI = new GlideRecord(addToTable);
			existingCI.addQuery("task", id);
			existingCI.query();
			var col = this.getCIField(addToTable);
			while (existingCI.next())
				result.push(existingCI.getValue(col) + '');

			var affectedCiGR = new GlideRecordSecure(listTableName);
			affectedCiGR.addEncodedQuery(fixedQuery, true);
			affectedCiGR.addEncodedQuery(query, true);
			affectedCiGR.query();
			while (affectedCiGR.next()) {
				//Check if the CI is already added to the list
				if (!result.includes(affectedCiGR.sys_id + '')) {
					affectedCI.initialize();
					affectedCI.task = id;
					affectedCI.setValue(col, affectedCiGR.sys_id);
					affectedCI.insert();
				}
			}
		}
	},

	getTotalNumberOfItems: function() {
		var query = this.getParameter("sysparm_query");
		var listTableName = this.getParameter("sysparm_table");
		var affectedCiGR = new GlideAggregate(listTableName);

		if (!affectedCiGR.canRead())
			return 0;

		affectedCiGR.addEncodedQuery(query, true);
		affectedCiGR.addAggregate('COUNT');
		affectedCiGR.query();
		if (affectedCiGR.next())
		   return affectedCiGR.getAggregate('COUNT') - 0;
		return 0;
	},

	isPublic: function() {
		return false;
	},

	type: "AssociateCIToTask"
});
