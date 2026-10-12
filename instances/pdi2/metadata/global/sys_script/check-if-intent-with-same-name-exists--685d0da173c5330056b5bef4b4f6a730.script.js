(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_nlu_intent');
	gr.addQuery('name', current.name);
	gr.addQuery('model', current.model);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.query();
	if(gr.getRowCount() > 0){
		gs.addErrorMessage(gs.getMessage('Intent with same name already exists.'));
		current.setAbortAction(true);
	}

})(current, previous);
