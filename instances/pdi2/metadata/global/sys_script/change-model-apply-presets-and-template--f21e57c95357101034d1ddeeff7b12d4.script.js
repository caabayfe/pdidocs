(function executeRule(current, previous /*null when async*/ ) {
	if (!current.chg_model_template.nil())
		new global.ChangeTemplate(current.getValue("chg_model_template")).applyTemplate(current);

	if (!current.chg_model.nil())
		new global.ChangeModel(current.chg_model.getRefRecord()).applyRecordPresets(current);
		
})(current, previous);
