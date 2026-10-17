if (current.operation() == 'update' && current.substatus.changes()) {
	gs.addErrorMessage(gs.getMessage('Cannot set to pre-allocated on an update. Please create a new record'));
	current.setAbortAction(true);
} else if (current.model_category.allow_pre_allocation != true || current.model.asset_tracking_strategy != 'leave_to_category') {
	gs.addErrorMessage(gs.getMessage('Cannot set as pre-allocated due to model and category constraints'));
	current.setAbortAction(true);   
} else if (current.sys_class_name == 'alm_consumable' || current.sys_class_name == 'alm_license')  {
	gs.addErrorMessage(gs.getMessage('Cannot set as pre-allocated due to asset type'));
	current.setAbortAction(true); 
} else if (current.quantity < 1)  {
	gs.addErrorMessage(gs.getMessage('Cannot set pre-allocated quantity to be less than 1'));
	current.setAbortAction(true); 
}   
