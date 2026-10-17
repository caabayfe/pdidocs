(function(current, action) {
	action.setRedirectURL(current);
	current.update();
	if (! current.isActionAborted())
    action.setRedirectURL(current);
})(current, action);
