doInsertAndStay();
function doInsertAndStay() {
	var oldSysID = current.getUniqueValue();
	var hadID = !current.id.nil();
	var saveMe = current;
	current.sys_scope = gs.getCurrentApplicationId();
	current.sys_policy = "";
	current.name = "Copy of " + current.name;
	current.id = "";
	current.servicenow = false;
	current.internal = false;
	var newSysID = current.insert();

	// dependencies
	var depGR = new GlideRecord('m2m_sp_widget_dependency');
	depGR.query("sp_widget", oldSysID);
	while (depGR.next()) {
		depGR.sp_widget = newSysID;
		depGR.insert();
	}

	// providers
	proGR = new GlideRecord('m2m_sp_ng_pro_sp_widget');
	proGR.query("sp_widget", oldSysID);
	while (proGR.next()) {
		proGR.sp_widget = newSysID;
		proGR.insert();
	}

	// save cloned widget's relationship to OOB parent
	new SPWidgetCloneUtils().createCloneRelationship(oldSysID, newSysID);
	
	gs.addInfoMessage(gs.getMessage("'{0}' Widget created", current.name));
	if (hadID)
		gs.addInfoMessage(gs.getMessage("Widget ID value cleared, add an ID if needed"));
	action.setRedirectURL(saveMe);
}
