current.update();
if (!current.isActionAborted()) {
	sc_ic_Factory.wrap(current).unpublish();
	action.setRedirectURL(current);
}
