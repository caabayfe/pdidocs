current.update();
if (!current.isActionAborted()) {
	sc_ic_Factory.wrap(current).publish();
	action.setRedirectURL(current);
}
