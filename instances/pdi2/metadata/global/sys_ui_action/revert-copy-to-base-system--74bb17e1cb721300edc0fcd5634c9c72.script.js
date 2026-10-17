var cancelIt= function(){};

var doIt= function(){
	// calls this script again
	gsftSubmit(null, g_form.getFormElement(), 'revert_to_base_record');
};

function getTableName(updateName) {
	var lastUnderscorePosition = updateName.lastIndexOf("_");
	if (lastUnderscorePosition < 0)
		return null;

	return updateName.substring(0, lastUnderscorePosition);
}

function getMessageBody() {
	var tableName = getTableName(g_form.getValue("file_name"));
	if (tableName=="sys_atf_step") {
		replace_by = "step";
		if (g_form.getValue("disposition")=="201")
			return getMessage("Insert a copy of the base step into the copied test? Click OK to continue");
		else if(g_form.getValue("disposition")=="203")
			return getMessage("Delete this step from the copied test? Click OK to continue");
	}
	return getMessage("Revert this copied record to the base record? Click OK to continue");
}

function confirmDialog() {
	var dialog = new GlideModal('glide_modal_confirm', true, 300);
	dialog.setTitle("Confirmation");
	dialog.setPreference("body", getMessageBody());
	dialog.setPreference("buttonLabelCancel", getMessage("Cancel"));
	dialog.setPreference("buttonLabelComplete", getMessage("OK"));
	dialog.setPreference('onPromptCancel', cancelIt.bind(this));
	dialog.setPreference('onPromptComplete', doIt.bind(this));
	dialog.render();
}


if (typeof window == 'undefined'){
	revert();
}

function revert() {
	new BaseUpgradeLogAPI().revertToBase(current.sys_id);	
	action.setRedirectURL(current);	
}
	
 
