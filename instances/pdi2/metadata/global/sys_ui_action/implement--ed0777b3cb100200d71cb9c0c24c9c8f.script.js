function moveToImplement() {
	g_form.setValue("state", "-1");
	gsftSubmit(null, g_form.getFormElement(), "state_model_move_to_implement");
}

if (typeof window == 'undefined')
   setRedirect();

function setRedirect() {
    current.update();
    action.setRedirectURL(current);
}
