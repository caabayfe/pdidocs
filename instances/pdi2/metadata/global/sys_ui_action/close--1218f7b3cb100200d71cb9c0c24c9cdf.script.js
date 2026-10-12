function moveToClosed() {
	g_form.setValue("state", "3");
	gsftSubmit(null, g_form.getFormElement(), "state_model_move_to_closed");
}

if (typeof window == 'undefined')
   setRedirect();

function setRedirect() {
    current.update();
    action.setRedirectURL(current);
}
