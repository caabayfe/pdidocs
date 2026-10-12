function openMonitorPopUp(){
	var gr = new GlideRecord('sys_soap_message_function');
	gr.addQuery("soap_message",g_form.getUniqueValue());
	gr.query();
	if(gr.hasNext()){
		var dialog = new GlideDialogWindow("glide_confirm_standard");
		dialog.setWidth("800");
		dialog.setTitle(getMessage("Generating SOAP Message"));
		dialog.setPreference('warning', true);
		dialog.setPreference('title', getMessage("Replace existing SOAP Message functions?"));
		dialog.setPreference('onPromptComplete', onPromptComplete);
		dialog.render(); //Open the dialog
		
	} else {
		gsftSubmit(null, g_form.getFormElement(), 'generate_soap'); //MUST call the 'Action name' set in this UI Action
	}
}

function onPromptComplete(){
	//Call the UI Action again but skip the 'onclick' function
	gsftSubmit(null, g_form.getFormElement(), 'generate_soap'); //MUST call the 'Action name' set in this UI Action
}

//Code that runs without 'onclick'
//Ensure call to server-side function with no browser errors
if (typeof window == 'undefined')
	serverResolve();

function serverResolve(){
	current.update();
	var generator = new SOAPMessageGenerator(current);
	generator.process();
	
	action.setRedirectURL(current);
}
