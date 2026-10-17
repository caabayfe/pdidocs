action.setRedirectURL(current);
current.update();
if (! current.isActionAborted())
    action.setRedirectURL(current);

if (!current.active ) {
//	deactivateSolutions();
}

function deactivateSolutions(){
	var solution = new GlideRecord("ml_solution");
	solution.addQuery("solution_definition", current.sys_id);
	solution.addQuery("active", true);
	solution.query();
	while (solution.next()) {
		solution.setValue("active", false);
		solution.setValue("last_activated_date", new GlideDateTime());
		solution.update();
	}
}
