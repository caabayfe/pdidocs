runUIAction();

function runUIAction() {
	current.update();
	// show Business Service Map
	action.setReturnURL(current);
	var gr = new GlideRecord('em_sla_configuration');
	gr.addQuery('sys_id', current.sys_id);
	gr.query();
	if (gr.next()) {
		var isUpdateInProcess = gr.getValue('update_in_process');
		if (isUpdateInProcess == false){
			action.setRedirectURL('/svc_ci_assoc_list.do?sysparm_view=em_sla_results&sysparm_query=service_id=' + current.sys_id);
		} else {
			gs.addInfoMessage(gs.getMessage("The SLA configuration service is loading. Please wait"));
		}
	}
}
