var returnUrl = current;
action.setReturnURL(returnUrl);
current.update();
if (!current.isActionAborted())
	action.setRedirectURL(returnUrl);
