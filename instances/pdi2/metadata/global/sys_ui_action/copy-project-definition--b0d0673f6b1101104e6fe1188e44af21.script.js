function copyProjectDef() {
    var map = getMessages(["Are you sure?", "Do you want to copy this configuration and create new project definition?"]);
    var warningMsg = '';

    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dialog = new dialogClass('glide_confirm_basic');
    dialog.setTitle(map["Are you sure?"]);
    dialog.setPreference('title', map["Do you want to copy this configuration and create new project definition?"] +"<br/><br/>");
    dialog.setPreference('onPromptComplete', onPromptCompleteForCopyModelDef);
    dialog.render();

}

function onPromptCompleteForCopyModelDef() {
    gsftSubmit(null, g_form.getFormElement(), 'copy_project_def');
}

if (typeof window == 'undefined')
    copyProjectDefinition();

function copyProjectDefinition() {
	try{
		validateExistingBreakdownFields();
		var grNewProject = new global.ProminUIAction().copyTableConfig(current);
		action.setRedirectURL(grNewProject);
	}catch(error) {
		gs.addErrorMessage(error);
        action.setRedirectURL(current);
	}
}

function validateExistingBreakdownFields() {
	var grBreakDownField = new GlideRecord("promin_breakdown_field");
	grBreakDownField.addQuery("entity.project", current.getUniqueValue());
	grBreakDownField.query();
	var invalidFields = [];
	while(grBreakDownField.next()) {
		var isValidField = new ProminAllowedColumns().getAllowedColumnList(grBreakDownField.getTableName(), grBreakDownField.entity.table, grBreakDownField.field, grBreakDownField.entity);
		if(!isValidField){
			invalidFields.push(grBreakDownField.getValue("field"));
		}
	}
	if(invalidFields.length != 0){
		throw gs.getMessage("Unsupported configuration: Project definition can not be copied due to invalid breakdowns [{0}]. Please delete invalid breakdowns to copy the project definition.",  invalidFields.toString());
	}
	
}
