function generateVariables() {
	var smp = new GlideRecord('sys_rest_message_fn_parameters');
	smp.addQuery('rest_message_function', g_form.getUniqueValue());
	smp.query();
	if (smp.next()) {//found existing variables that might be deleted
		var dialog = new GlideDialogWindow("glide_confirm_standard");
		dialog.setWidth("800");
		dialog.setTitle(getMessage("Generating Variables"));
		dialog.setPreference('warning', true);
		dialog.setPreference('title', getMessage("'Variable substitutions' which are already defined but not referenced in either the endpoint, query parameter values, header values, or content body will be removed. Do you want to continue?"));
		dialog.setPreference('onPromptComplete', onPromptComplete);
		dialog.render(); //Open the dialog
	} else {
		onPromptComplete();
	}
}

function onPromptComplete(){
	//Call the UI Action again but skip the 'onclick' function
	gsftSubmit(null, g_form.getFormElement(), 'generate_variables'); //MUST call the 'Action name' set in this UI Action
}

//Code that runs without 'onclick'
//Ensure call to server-side function with no browser errors
if (typeof window == 'undefined')
	serverResolve();

function serverResolve(){
	current.update();
	var au = new ArrayUtil();
	var existingVars = [];
    var rm = new sn_ws.RESTMessageV2(current.rest_message.name, current.function_name, gs.getCurrentApplicationId());
    var variables = rm.getVariables();

	//check existing variables, remove old unneeded ones and populate the exising vars array
	var smp = new GlideRecord('sys_rest_message_fn_parameters');
    smp.addQuery('rest_message_function', current.sys_id);
	smp.query();
	while (smp.next()) {
		var variableName = smp.getValue('name');
		if (au.contains(variables, variableName)) {
			existingVars.push(variableName);
		} else {
			smp.deleteRecord();//old var that not needed based on new getVariables call
		}
	}
	
	for (var i = 0; i < variables.length; i++) {
		if (!au.contains(existingVars, variables[i])){
			smp.initialize();
			smp.name = variables[i];
			smp.rest_message_function = current.sys_id;
			smp.insert();
		}
	}

	action.setRedirectURL(current);
}
