updateIARFeedbackValue();

function updateIARFeedbackValue() {
	var choiceGr = new GlideRecord('sys_choice');
	choiceGr.addQuery('name', AutoResolutionConstants.PREDICTION_OUTPUT_TABLE_NAME);
	choiceGr.addQuery('element', 'feedback_value');
	choiceGr.setValue("inactive", true);
	choiceGr.updateMultiple();
	
	var columnGr = new GlideRecord('sys_dictionary');
	columnGr.addQuery('name', AutoResolutionConstants.PREDICTION_OUTPUT_TABLE_NAME);
	columnGr.addQuery('element', 'feedback_value');
	columnGr.query();
	
	//No need to update value if field doesn't exist or it is already a String type
	if (!columnGr.next() || columnGr.getValue('internal_type') === 'string'){
		return;
	}
	
	columnGr.setValue('internal_type', 'string');
	columnGr.update();
}
