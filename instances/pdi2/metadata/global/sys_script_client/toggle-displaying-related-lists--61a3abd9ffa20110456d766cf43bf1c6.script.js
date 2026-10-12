function onLoad() {
	
	var sysId = g_form.getUniqueValue();
	var ga = new GlideAjax('CMDBDataManagerAjaxUtil');
	ga.addParam("sysparm_name", "getPolicyTypeId");
	ga.addParam('sysId', sysId);
	ga.getXMLAnswer(function (policyTypeId){
		
		var deleteRelatedEntryPolicyId = 'c3059c79ff920110456d766cf43bf1c6';
		var taskToCiRelatedList = 'cmdb_data_management_task_to_ci.cmdb_data_management_task';
		var taskToDocumentRelatedList = 'cmdb_data_management_task_to_document.cmdb_data_management_task';
		
		//for policy type Delete CMDB Related Entry - hide taskToci related list 
		if (policyTypeId === deleteRelatedEntryPolicyId) {
			g_form.hideRelatedList(taskToCiRelatedList);
		} else {
			g_form.hideRelatedList(taskToDocumentRelatedList);
		}
	});
}
