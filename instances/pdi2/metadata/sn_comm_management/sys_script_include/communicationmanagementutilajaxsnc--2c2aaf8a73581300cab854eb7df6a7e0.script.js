var CommunicationManagementUtilAjaxSNC = Class.create();
CommunicationManagementUtilAjaxSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	getCommTaskSourceTable: function() {
		var sys_id = this.getParameter('sysparm_comm_task');
		var gr = new GlideRecord(CommunicationManagementUtil.prototype.TABLES.COMM_TASK);
		if (gr.get(sys_id) && gr.canRead() && gr.comm_plan && gr.comm_plan.canRead()) {
			if (gr.comm_plan.getRefRecord().getRecordClassName() == CommunicationManagementUtil.prototype.TABLES.INCIDENT_ALERT)
				return CommunicationManagementUtil.prototype.TABLES.INCIDENT;
			if (gr.comm_plan.source && gr.comm_plan.source.getRefRecord().getRecordClassName())
				return gr.comm_plan.source.getRefRecord().getRecordClassName();
		}
	}
});
