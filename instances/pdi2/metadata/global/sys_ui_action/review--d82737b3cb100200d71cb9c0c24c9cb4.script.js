function moveToReview() {
	g_form.setValue("state", "0");
	gsftSubmit(null, g_form.getFormElement(), "state_model_move_to_review");
}

if (typeof window == 'undefined')
   setRedirect();

function setRedirect() {
    current.update();
    action.setRedirectURL(current);
}
