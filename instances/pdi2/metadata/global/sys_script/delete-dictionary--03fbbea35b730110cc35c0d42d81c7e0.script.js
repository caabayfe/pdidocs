// prevent transaction cancellation by quota rules
var t = null;
var isUncancelable = false;
try {
	// store original uncancelable state
	t = GlideTransaction.get();
	if (t != null) {
		isUncancelable = t.isUncancelable();
		t.setCannotCancel(true);
	}

	gs.print('Removing dictionary entries for ' + current.name);
	var dict = new GlideRecord('sys_dictionary');
	dict.initialize();
	dict.setWorkflow(true);
	dict.addQuery('name', current.name);
	dict.query();
	dict.deleteMultiple();

} finally {
	// restore original uncancelable state
	if (t != null)
		t.setCannotCancel(isUncancelable);
}
