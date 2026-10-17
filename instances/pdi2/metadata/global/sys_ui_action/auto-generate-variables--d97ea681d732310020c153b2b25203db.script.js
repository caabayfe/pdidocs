function generateVariables() {
	var smp = new GlideRecord('sys_soap_message_parameters');
	smp.addQuery('soap_function', g_form.getUniqueValue());
	smp.query();
	if (smp.next()) {//found existing variables that might be deleted
		var dialog = new GlideDialogWindow("glide_confirm_standard");
		dialog.setWidth("800");
		dialog.setTitle(getMessage("Generating Variables"));
		dialog.setPreference('warning', true);
		dialog.setPreference('title', getMessage("'Variable substitutions' which are already defined but not referenced in the SOAP envelope will be removed. Do you want to continue?"));
		dialog.setPreference('onPromptComplete', onPromptCompleteVariables);
		dialog.render(); //Open the dialog
	} else {
		onPromptCompleteVariables();
	}
}

function onPromptCompleteVariables(){
	//Call the UI Action again but skip the 'onclick' function
	gsftSubmit(null, g_form.getFormElement(), 'generate_variables_soap'); //MUST call the 'Action name' set in this UI Action
}

//Code that runs without 'onclick'
//Ensure call to server-side function with no browser errors
if (typeof window == 'undefined')
	serverResolve();

function serverResolve(){
	current.update();
	var au = new ArrayUtil();
	var existingVars = [];
	var sg =  new sn_ws.SOAPMessageTest();
	var variables = sg.getVariables(current.soap_message.sys_scope.scope + '.' + current.soap_message.name, current.function_name, gs.getCurrentApplicationId());
	

	//check existing variables, remove old unneeded ones and populate the exising vars array
	var smp = new GlideRecord('sys_soap_message_parameters');
	smp.addQuery('soap_function', current.sys_id);
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
			smp.soap_function = current.sys_id;
			smp.insert();
		}
	}

	action.setRedirectURL(current);
}	
