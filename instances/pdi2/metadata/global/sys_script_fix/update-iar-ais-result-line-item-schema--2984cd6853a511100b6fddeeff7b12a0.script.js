removeOutdatedFeedbackChoices();
renameExistingFeedbackValues();
updateFeedbackTypeColumn();

/**
 * Removes the positive and negative choices for the feedback type columns if they exist.
 */
function removeOutdatedFeedbackChoices() {
	var choiceGr = new GlideRecord("sys_choice");
	choiceGr.addQuery("name", AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
	choiceGr.addQuery("element", AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME);
	choiceGr.addQuery("inactive", false);
	var queryCondition = choiceGr.addQuery("value", "positive");
	queryCondition.addOrCondition("value", "negative");
	
	choiceGr.setValue("inactive", true);
	choiceGr.updateMultiple();

	gs.info("Executing IAR Fix Script: Deactivated the positive and negative choices for the {0} element on the {1} table.", 
			AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME,
			AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
}

/**
 * Updates sys_dictionary record for the feedback_type column
 */
function updateFeedbackTypeColumn() {
	var dictionaryGr = new GlideRecord("sys_dictionary");
	dictionaryGr.addQuery("name", AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
	dictionaryGr.addQuery("element", AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME);
	dictionaryGr.query();
	
	if (!dictionaryGr.next()) {
		gs.error("Executing IAR Fix Script: Failed to update the read_only dictionary field for the {0} element on the {1} table to false because the element does not exist", 
			AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME,
			AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
		return;
	}
	
	removeReadOnlyStatusOnFeedbackTypeColumn(dictionaryGr);
	renameFeedbackTypeColumnLabel(dictionaryGr);
	
	var dictionarySysId = dictionaryGr.update();
	if (gs.nil(dictionarySysId)) {
		gs.error("Executing IAR Fix Script: Failed to update the sys_dictionary record {0} for the {1} element on the {2} table.",
			dictionarySysId,
			AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME,
			AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
		return;
	}
	
	gs.info("Executing IAR Fix Script: Successfully updated the sys_dictionary record {0} for the {1} element on the {2} table.",
			dictionarySysId,
			AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME,
			AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
}

/**
 * Removes the read-only status on the Feedback column of an AI Search Result Line Item record. 
 */
function removeReadOnlyStatusOnFeedbackTypeColumn(dictionaryGr) {
	if (!dictionaryGr.read_only) {
		gs.info("Executing IAR Fix Script: Skipping update on setting the read_only dictionary field for the {0} element on the {1} table to false because the element is already false", 
			AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME,
			AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
		return;
	}
	
	dictionaryGr.read_only = false;
	gs.info("Executing IAR Fix Script: Setting the read_only dictionary field for the {0} element on the {1} table to false", 
			AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME,
			AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
}

/**
 * Renames feedback_type values of existing records from positive and negative to helpful and not_helpful, respectively.
 */
function renameExistingFeedbackValues() {
	var lineItemGr = new GlideRecord(AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
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
				originalFeedbackValue, updatedFeedbackValue, AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME, 
				lineItemSysId);
			return;
		}
		
		gs.info("Executing IAR Fix Script: Successfully updated the feedback value from {0} to {1} on the {2} record {3}", 
			originalFeedbackValue, updatedFeedbackValue, AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME,
			lineItemSysId);
	}
}

/**
 * Renames feedback_type column label from "User feedback type" to "Feedback".
 */
function renameFeedbackTypeColumnLabel(dictionaryGr) {
	if (dictionaryGr.getValue("column_label") != "User Feedback type") {
		gs.info("Executing IAR Fix Script: Skipping the renaming of the {0} column label from 'User Feedback type' to 'Feedback' on the {1} table since the column label was not 'User feedback type' initially", 
			AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME,
			AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
		return;
	}
	
	dictionaryGr.setValue("column_label", "Feedback");
	gs.info("Executing IAR Fix Script: Renaming the {0} column label from 'User feedback type' to 'Feedback' on the {1} table", 
			AutoResolutionConstants.IAR_LINE_ITEM_FEEDBACK_TYPE_FIELD_NAME,
			AutoResolutionConstants.AI_SEARCH_RESULT_LINE_ITEM_TABLE_NAME);
}
