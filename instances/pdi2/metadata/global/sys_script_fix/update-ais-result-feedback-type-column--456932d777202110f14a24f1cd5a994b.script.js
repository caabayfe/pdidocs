removeOutdatedFeedbackChoices();
renameExistingFeedbackValues();

/**
 * Removes the positive and negative choices for the feedback type columns if they exist.
 */
function removeOutdatedFeedbackChoices() {
	var choiceGr = new GlideRecord("sys_choice");
	choiceGr.addQuery("name", AutoResolutionConstants.AI_SEARCH_RESULT_TABLE_NAME);
	choiceGr.addQuery("element", AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME);
	choiceGr.addQuery("inactive", false);
	var queryCondition = choiceGr.addQuery("value", "positive");
	queryCondition.addOrCondition("value", "negative");

	choiceGr.setValue("inactive", true);
	choiceGr.updateMultiple();

	gs.info("Executing IAR Fix Script: Deactivated the positive and negative choices for the {0} element on the {1} table.", 
			AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME,
			AutoResolutionConstants.AI_SEARCH_RESULT_TABLE_NAME);
}

/**
 * Renames feedback_type values of existing records from positive and negative to helpful and not_helpful, respectively.
 */
function renameExistingFeedbackValues() {
	var lineItemGr = new GlideRecord(AutoResolutionConstants.AI_SEARCH_RESULT_TABLE_NAME);
	var queryCondition = lineItemGr.addQuery(AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME, "positive");
	queryCondition.addOrCondition(AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME, "negative");
	lineItemGr.query();
	
	while (lineItemGr.next()) {
		var originalFeedbackValue = lineItemGr.getValue(AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME);
		var updatedFeedbackValue = originalFeedbackValue;
		switch (originalFeedbackValue) {
			case "positive":
				updatedFeedbackValue = AutoResolutionConstants.FEEDBACK_HELPFUL;
				break;
			case "negative":
				updatedFeedbackValue = AutoResolutionConstants.FEEDBACK_NOT_HELPFUL;
				break;
			default:
				break;
		}
		
		lineItemGr.setValue(AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME, updatedFeedbackValue);
		var lineItemSysId = lineItemGr.update();
		if (gs.nil(lineItemSysId)) {
			gs.error("Executing IAR Fix Script: Failed to update the feedback value from {0} to {1} on the {2} record {3}", 
				originalFeedbackValue, updatedFeedbackValue, AutoResolutionConstants.AI_SEARCH_RESULT_TABLE_NAME, 
				lineItemSysId);
			return;
		}
		
		gs.info("Executing IAR Fix Script: Successfully updated the feedback value from {0} to {1} on the {2} record {3}", 
			originalFeedbackValue, updatedFeedbackValue, AutoResolutionConstants.AI_SEARCH_RESULT_TABLE_NAME,
			lineItemSysId);
	}
}
