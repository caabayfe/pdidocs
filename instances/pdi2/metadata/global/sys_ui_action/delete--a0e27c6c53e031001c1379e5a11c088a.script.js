runUIAction();

function runUIAction() {
	var gr = new GlideRecord('sa_m2m_service_entry_point');
	gr.addQuery('cmdb_ci_endpoint', current.sys_id);
	gr.query();
	if (gr.next()) {
		var bsId = gr.cmdb_ci_service + '';
		var entryPointId=gr.cmdb_ci_endpoint+'';
		var bsManager = new SNC.BusinessServiceManager();
		if(!bsManager.removeEntryPoint(bsId, entryPointId)){
			gs.addErrorMessage(bsManager.error);
		}

	}
}
