excludedBreakdownCombinationMustBeUnique();
function excludedBreakdownCombinationMustBeUnique() {
	var msg = gs.getMessage('Excluded Breakdown combination already exists');

	var check = new GlideRecord("pa_indicator_breakdown_excl");
	check.addQuery("indicator", current.indicator);
	check.query();

	while (check.next()) {
		if ((check.breakdown == current.breakdown && check.breakdown_level2 == current.breakdown_level2) || (check.breakdown == current.breakdown_level2 && check.breakdown_level2 == current.breakdown)) {
			gs.addErrorMessage(msg);
			current.setAbortAction(true);
			return false;
		}
	}
	return true;
}
