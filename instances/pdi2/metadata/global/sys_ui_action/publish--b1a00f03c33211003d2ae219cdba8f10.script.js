if (current.changes())
	current.update();

if (!current.isActionAborted()) {
	sc_ic_Factory.wrap(current).publish();
}
