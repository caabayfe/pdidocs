function moveToScheduled() {
	g_form.setValue("state", "-2");
	gsftSubmit(null, g_form.getFormElement(), "state_model_move_to_scheduled");
}

if (typeof window == 'undefined')
   setRedirect();

function setRedirect() {
    current.update();
    action.setRedirectURL(current);
}
