(function(){
	if(current.downgrade_child.nil() || current.upgrade_parent.nil()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('The upgrade and downgrade fields are mandatory.'));
	} else if(!current.license.nil() && current.license.model != current.downgrade_child && current.license.model != current.upgrade_parent) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('The downgrade or upgrade must be set to the license model.'));
	} else if(current.downgrade_child != '' && current.downgrade_child == current.upgrade_parent) {
		//Upgrade and downgrade fields cannot be the same
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('The downgrade and upgrade cannot be the same model.'));
	} else {
		//Do not allow duplicate records
		var gr = new GlideRecord('cmdb_m2m_downgrade_model');
		gr.addQuery('sys_id', '!=', current.sys_id);
		gr.addQuery('license', current.license);
		gr.addQuery('downgrade_child', current.downgrade_child);
		gr.addQuery('upgrade_parent', current.upgrade_parent);
		gr.addQuery('start_date', current.start_date);
		gr.addQuery('end_date', current.end_date);
		gr.query();
		if(gr.getRowCount() > 0) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('A duplicate record already exists.'));
		}
	}
})();
