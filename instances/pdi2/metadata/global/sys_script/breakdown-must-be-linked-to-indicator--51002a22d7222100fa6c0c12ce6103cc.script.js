breakdownMustBeLinkedToIndicator();
function breakdownMustBeLinkedToIndicator() {
	var msg = gs.getMessage('Selected Breakdown is not linked to Indicator');

	var check = new GlideRecord("pa_indicator_breakdowns");
	check.addQuery("indicator", current.indicator);	
	check.query();

	while (check.next()) {
		if (check.breakdown == current.breakdown)
			return true;
	}
	gs.addErrorMessage(msg);
	current.setAbortAction(true);
	return false;
}
