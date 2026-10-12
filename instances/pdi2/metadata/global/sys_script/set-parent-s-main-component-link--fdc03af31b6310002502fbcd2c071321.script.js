var model = new GlideRecord('cmdb_model');
if (model.get(current.parent)) {
	if (current.master == true) {
		// look for the bundle category (there can be only one with bundle flag)
		// get its sys id
		// current...cmdb_model_category.contains(bundle category's sys_id)

		if (!model.main_component.nil()) {
			//there can only be one main component
			current.master = false;
			gs.addInfoMessage(gs.getMessage('Reset main component flag to false since a main component already exists for this model'));
		} else if (current.model_category.allow_as_master == true && current.child.asset_tracking_strategy == 'leave_to_category') {
			// check we can actually be master component
			model.main_component = current.sys_id;
			model.update();
		} else {
			gs.addErrorMessage(gs.getMessage('Cannot set as main component due to component model and category constraints'));
			current.setAbortAction(true);
		}
	}
	else {
	// clear bundle's main component link
	model.main_component = '';
	model.update();
	}
}
