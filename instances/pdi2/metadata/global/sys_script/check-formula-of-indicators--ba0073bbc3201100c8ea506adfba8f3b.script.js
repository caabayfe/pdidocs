var formula = new SNC.PAFormula(current.formula, current.sys_id);
if (formula.isValid() == false) {
	current.setAbortAction(true);
} else {
	var gr = new GlideRecord("pa_single_expression");
	gr.addQuery("indicator", current.getUniqueValue());
	gr.query();
	if (gr.next()) {
		gr.deleteRecord();
	}
}

current.formula = formula.getFormula();
