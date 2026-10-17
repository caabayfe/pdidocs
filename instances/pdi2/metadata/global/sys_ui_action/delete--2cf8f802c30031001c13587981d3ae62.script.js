runUIAction();

function runUIAction() {
	var bsId;
	var gr = new GlideRecord('sa_m2m_service_entry_point');
	gr.addQuery('sys_id', current.sys_id);
	gr.query();
	if (gr.next()) {
		bsId = gr.cmdb_ci_service + '';
		var entryPointId=gr.cmdb_ci_endpoint+'';
		gs.log('Deleting BS bsId - '+ bsId);
		var bsManager = new SNC.BusinessServiceManager();
		if(!bsManager.removeEntryPoint(bsId, entryPointId)){
			gs.addErrorMessage(bsManager.error);
		}
	}
	var currUrl = '/cmdb_ci_service_discovered.do?sys_id='+bsId;
	action.setReturnURL(currUrl);
	action.setRedirectURL(currUrl);
}
