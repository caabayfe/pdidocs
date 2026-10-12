var formula = new SNC.PAFormula(current.formula, current.sys_id);
if (formula.isValidCalendarFrequency(current.calendar_freq) == false) {
	gs.addErrorMessage(gs.getMessage('Formula should contain atleast one indicator based on specified calendar frequency'));
	current.setAbortAction(true);
}
