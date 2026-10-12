function moveToAuthorize(){
	g_form.setValue("state", "-3");
	gsftSubmit(null, g_form.getFormElement(), 'state_model_request_cab_approval');
}

if (typeof window == 'undefined')
   updateAndRedirect();

function updateAndRedirect() {
    current.update();
    action.setRedirectURL(current);
}
