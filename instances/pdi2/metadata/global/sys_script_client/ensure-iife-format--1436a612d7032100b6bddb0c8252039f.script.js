if(typeof gFormAlreadySubmitted == "undefined" ||  typeof gFormAlreadySubmitted == "null")
	gFormAlreadySubmitted = false;

function onSubmit() {
	var scope = g_scratchpad.scope;
	if (gFormAlreadySubmitted || ("global" == scope) || g_scratchpad.use_scoped_format == "false")
       return true;
    
	//For scoped-application UI Scripts, the scripts must follow our IIFE pattern.
	var name = g_form.getValue("script_name");
	// NOTE: validateUIScriptIIFEPattern is a UI Script
	if (validateUIScriptIIFEPattern("script" ,scope, name))
		return true;
	
	showIIFEScriptDialog();	
	return false;
}

function showIIFEScriptDialog() {
	var message = getMessage("You are not using the default UI Script pattern.");
	message += " " + getMessage("If you are importing a 3rd-party library like Angular or YUI, click OK.");
	message += " " + getMessage("Otherwise, use the Cancel button to return to your script and resolve the error.");

    var dialog = new GlideDialogWindow('glide_confirm_standard');
    dialog.setTitle(new GwtMessage().getMessage('Scoped UI Script does not match default pattern'));
    dialog.setPreference('warning', true);
    dialog.setPreference('title', message);
    dialog.setPreference('onPromptComplete',  confirm.bind(this));
    dialog.setPreference('onPromptCancel', cancel.bind(this));
    dialog.render(); 
}

function confirm() {
	gFormAlreadySubmitted = true;
    gsftSubmit(gel(g_form.getActionName()));
}

function cancel() {
	gFormAlreadySubmitted = false;
}
