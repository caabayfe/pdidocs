var ShowRelatedTasksAjax = Class.create();

ShowRelatedTasksAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getRelatedTaskCount : function() {
		var ci = this.getParameter("sysparm_ci");
		var ciGR = new GlideRecord("cmdb_ci");
		if (!ciGR.get(ci))
			return "0"; // CI record doesn't exist
		
		ciGR = GlideScriptRecordUtil.get(ciGR).getRealRecord();
		if (!ciGR.canRead())
			return "0"; // user cannot read CI record
		
		var task = this.getParameter("sysparm_task");
		var gr = new GlideRecord("task_ci");
		if (!gr.canRead())
			return "0"; // user cannot read task_ci records
		
		gr.addQuery("ci_item", ci);
		gr.addQuery("task.active", true);
		gr.addQuery("task", "!=", task);
		gr.setLimit(1);
		gr.query();
		return gr.getRowCount();
	},
});
