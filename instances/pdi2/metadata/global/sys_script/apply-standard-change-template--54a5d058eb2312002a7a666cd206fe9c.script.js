(function executeRule(current, previous /*null when async*/) {
	if (!current.isNewRecord())
		return;

	if (!current.std_change_producer_version.std_change_producer.canRead() || !GlideappCatalogItem.get(current.std_change_producer_version.std_change_producer).canView()) {
		gs.addErrorMessage(gs.getMessage("This Standard Change does not exist or you do not have access to it"));
		return;
	}

	if (gs.getProperty(new StdChangeUtils().SYS_PROP_PREVENT_INACTIVE_INSERT, "false") === "true" && current.std_change_producer_version.std_change_producer.active.getValue() !== "1"){
		gs.addErrorMessage(gs.getMessage("Change Requests cannot be created from an inactive Standard Change Template: {0}", current.std_change_producer_version.std_change_producer.name.getDisplayValue()));
		return;
	}

	var template = GlideTemplate.get(current.std_change_producer_version.std_change_producer.template);
	template.apply(current);

	var isWorkspace = false;
	try {
		isWorkspace = (typeof RP === 'undefined');
	} catch (err) {
		isWorkspace = false;
	}

	if (isWorkspace)
		gs.addInfoMessage(gs.getMessage("Save the form to create this change request."));
	else
		gs.addInfoMessage(gs.getMessage("Save or Submit the form to create this Change Request."));

})(current, previous);
