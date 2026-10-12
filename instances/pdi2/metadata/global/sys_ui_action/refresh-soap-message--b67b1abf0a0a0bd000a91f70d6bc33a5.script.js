function openMonitorPopUp(){
   var dialog = new GlideDialogWindow("glide_confirm_standard");
   dialog.setWidth("800");
   dialog.setTitle(getMessage("Refreshing SOAP Message"));
   dialog.setPreference('warning', true);
   dialog.setPreference('title', getMessage("Replace existing SOAP message."));
   dialog.setPreference('onPromptComplete', onPromptComplete);
   dialog.render(); //Open the dialog
}

function onPromptComplete(){
	//Call the UI Action again but skip the 'onclick' function
	gsftSubmit(null, g_form.getFormElement(), 'refresh_soap'); //MUST call the 'Action name' set in this UI Action
}

//Code that runs without 'onclick'
//Ensure call to server-side function with no browser errors
if (typeof window == 'undefined')
   serverResolve();

function serverResolve(){
	current.update();
	var wsclient;
	if(current.use_basic_auth){
    	var userPassword = current.basic_auth_password.getDecryptedValue();
		wsclient = new GlideWSClient(current.soap_message.wsdl,current.basic_auth_user,userPassword);
	} else {
		wsclient = new GlideWSClient(current.soap_message.wsdl);
	}
	try{
		current.soap_endpoint = wsclient.getSoapEndpoint();
		current.soap_action = wsclient.getSoapAction(current.function_name);
		current.envelope = wsclient.createSoapRequest(current.function_name);
		current.update();
	} catch (e) {
     	gs.addErrorMessage(wsclient.getErrorMessage());
	}
	action.setRedirectURL(current);
}        
