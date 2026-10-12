var changeConfirmCancelDialog;

function setChangeCancelState() {
	g_form.setValue("state", "4");
}

if (typeof window == 'undefined')
   setRedirect();

function setRedirect() {
    current.update();
    action.setRedirectURL(current);
}
