checkExist();

function checkExist(){
	// Make sure the updated version does not exist.
	var gr = new GlideRecord('bsm_chart');
	gr.addQuery('ci', current.ci);
	gr.addQuery('user', current.user);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('version', current.version);
	
	gr.query();
	if (gr.next()){
		gs.addInfoMessage('A saved view with the same version already exists');
		current.setAbortAction(true);
		return;
	}
}
