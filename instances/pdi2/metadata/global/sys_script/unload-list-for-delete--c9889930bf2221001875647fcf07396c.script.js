if (gs.nil(current.getValue("sys_user"))) {
	//Need to unload the sys_ui_list for delete because you can't
	//delete a list from the slushbucket (but not when its for an individual)
	//The sys_ui_list is update sync custom, so the version and update have to be manually created.
	var u = new GlideUpdateManager2();
	var sl = new GlideSysList(current.name);
	// SysList API unable to find record otherwise, resulting
	// in missing values in delete payload
	sl.setListID(current.sys_id);
	if (current.view && current.view != null && current.view.name && !gs.nil(current.view.name))
		sl.setViewName(current.view.name);

	if (current.parent && !gs.nil(current.parent))
		sl.setRelatedParentName(current.parent);

	if (current.relationship && !gs.nil(current.relationship))
		sl.setRelationshipID(current.relationship);

	if (current.sys_scope && !gs.nil(current.sys_scope))
		sl.setScopeID(current.sys_scope);

	if (current.sys_package && !gs.nil(current.sys_package))
		sl.setPackageID(current.sys_package);

	if (current.sys_domain && !gs.nil(current.sys_domain))
		sl.setDomain(current.sys_domain);

	u.saveListElements(sl);
}

//flush for the delete
SNC.FormsCacheFlushHandler.flush(current.getTableName());
