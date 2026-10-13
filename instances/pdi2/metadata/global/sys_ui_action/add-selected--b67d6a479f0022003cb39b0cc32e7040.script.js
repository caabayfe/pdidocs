var parent_id = getParentId();

if (parent_id) {
	var alertManager = new SNC.AlertManager();
	alertManager.addAlertsToGroups(current.sys_id,parent_id,true);

	var url = "em_alert.do?sysparm_query=sys_id%3D" + parent_id;
	action.setRedirectURL(url);
				gs.addInfoMessage(gs.getMessage("Added {0} as a secondary to {1}.",  [current.number, getParentNumber()]));

}
else {
		gs.addErrorMessage(gs.getMessage("This operation is not supported. To add an alert to a group, go to the primary alert form, change back to use \"Default view\" and use the \"Add To Group\" action."));
}

function getParentNumber(){
	return gs.getSession().getClientData('em_add_parent_number');
}

function getParentId(){	
	return gs.getSession().getClientData('em_add_parent_id');
}
