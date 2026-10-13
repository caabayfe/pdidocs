runUIAction();

function runUIAction() {
	current.update();
	if(current.operational_status == 2){
		gs.addInfoMessage(gs.getMessage("The Dynamic CI Group must be operational"));
		return;
	}
	// show Business Service Map
	action.setReturnURL(current);
	
	var gr = new GlideRecord('cmdb_ci_query_based_service');
	gr.addQuery('sys_id', current.sys_id);
	gr.query();
	if (gr.next()) {
		var isUpdateInProcess = gr.getValue('update_in_process');
		if (isUpdateInProcess == false){
			action.setRedirectURL('/$sa_qbs_view.do?sysparm_plugin_mode=assurance'+
								  '&sysparam_back_ref=quary_based_assurance_table'+
								  '&sysparm_bsid=' + current.sys_id+'&sysparm_bsname=' + current.name);
		} else {
			gs.addInfoMessage(gs.getMessage("The Dynamic CI Group is loading. Please wait"));
		}
	}
}
