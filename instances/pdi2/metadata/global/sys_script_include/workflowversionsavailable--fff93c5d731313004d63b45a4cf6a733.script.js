var WorkflowVersionsAvailable = Class.create();
WorkflowVersionsAvailable.prototype = {
    initialize: function() {
    },
	
	getPublishedWorkflowsExcludingTable: function(tableName) {
		var gr = new GlideRecordSecure('wf_workflow_version');
		gr.addActiveQuery();
		gr.addQuery('published', true);
		if (tableName && !GlideStringUtil.nil(tableName)) {
			if (!gs.tableExists(tableName)) {
				gs.warn('WorkflowVersionsAvailable: invalid tableName: ' + tableName);
				return 'sys_idIN';
			}
			gr.addQuery('table', '!=', tableName);
		}

		gr.query();
		var ids = [];
		while (gr.next()) {
			var wfId = gr.workflow + "";
			if (GlideStringUtil.isEligibleSysID(wfId))
				ids.push(wfId);
		}

		return 'sys_idIN' + ids.join(',');
	},

    type: 'WorkflowVersionsAvailable'
};
