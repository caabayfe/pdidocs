var BulkAddChangeRequest = Class.create();
BulkAddChangeRequest.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	PARAMS: {
		SYSID: "sysparm_sys_id",
		TABLE: "sysparm_table",
		VIEW: "sysparm_view",
		NOSTACK: "sysparm_nostack",
		QUERY: "sysparm_query",
		FIXEDQUERY: "sysparm_fixed_query",
		PARENTCOLUMN: "sysparm_parent_column",
		SELECTEDTASKS: "sysparm_selected_tasks",
		TYPE: "sysparm_type"
	},

	ALLOWED_TABLES: ["change_request", "change_task"],

	getURL: function(){
		var sysId = this.getParameter(this.PARAMS.SYSID);
		var url = new GlideURL("task_add_change_req.do");
		url.set(this.PARAMS.SYSID, sysId);
		url.set(this.PARAMS.VIEW, "default");
		url.set(this.PARAMS.NOSTACK, "true");
		url.set(this.PARAMS.QUERY, "active=true^ORDERBYDESCsys_created_on");
		url.set(this.PARAMS.TABLE, "change_request");
		url.set(this.PARAMS.FIXEDQUERY, "parentISEMPTY");
		return url;
	},

	linkChangeReqToTask: function(){
		var taskSysId = this.getParameter(this.PARAMS.SYSID);
		var table = this.getParameter(this.PARAMS.TABLE);
		var selectedRecords = this.getParameter(this.PARAMS.SELECTEDTASKS);
		var query = this.getParameter(this.PARAMS.QUERY);
		var parentColumn = this.getParameter(this.PARAMS.PARENTCOLUMN);
		var type = this.getParameter(this.PARAMS.TYPE);

		var logger = new GSLog('com.snc.change_request.bulk.add.log', this.type);

		if (!taskSysId) {
			logger.logError("[BulkAddChangeRequest] Invalid Parameter - sysparm_sys_id is empty or null");
			return;
		}
		if (!table) {
			logger.logError("[BulkAddChangeRequest] Invalid Parameter - sysparm_table is empty or null");
			return;
		}
		if (!parentColumn) {
			logger.logError("[BulkAddChangeRequest] Invalid Parameter - sysparm_parent_column is empty or null");
			return;
		}
		if (!this.ALLOWED_TABLES.includes(String(table))) {
			logger.logError(gs.getMessage("[BulkAddChangeRequest] Invalid Parameter - sysparm_table {0} is not allowed", [table]));
			return;
		}

		var relatedRecordGr = new GlideRecordSecure(table);
		relatedRecordGr.addQuery(parentColumn, 'null');
		if (type == 'add_selected')
			relatedRecordGr.addQuery('sys_id', 'IN', selectedRecords);
		else
			relatedRecordGr.addEncodedQuery(query, true);

		relatedRecordGr.query();
		var resultObj = {
			failedChgNum: [],
		};
		while (relatedRecordGr.next()) {
			if (relatedRecordGr.canWrite() && relatedRecordGr.getElement(parentColumn).canWrite()) {
				relatedRecordGr.setValue(parentColumn, taskSysId);
				relatedRecordGr.update();
			} else
				resultObj.failedChgNum.push('' + relatedRecordGr.number);

		}

		if (resultObj.failedChgNum.length > 0)
			logger.logWarning('[BulkAddChangeRequest] user ' + gs.getUserName() + ' does not have write access to parent column of following Changes: ' + resultObj.failedChgNum.join(','));

		return JSON.stringify(resultObj);
	},
	
    type: 'BulkAddChangeRequest'
});
