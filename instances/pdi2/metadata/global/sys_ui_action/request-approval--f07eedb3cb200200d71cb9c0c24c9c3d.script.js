function moveToAssess(){
	g_form.setValue("state", "-4");
	gsftSubmit(null, g_form.getFormElement(), 'state_model_request_assess_approval');
}

if (typeof window == 'undefined')
   updateAndRedirect();

function updateAndRedirect() {
    current.update();
    action.setRedirectURL(current);
}
