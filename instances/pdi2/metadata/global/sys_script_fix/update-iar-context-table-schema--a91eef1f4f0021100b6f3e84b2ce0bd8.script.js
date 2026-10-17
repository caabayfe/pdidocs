executeFix();

function executeFix() {
	updateTaskProcessingStateChoiceRecords();
}

/**
 * Updates choice records for the task_processing_state field on the context table.
 */
function updateTaskProcessingStateChoiceRecords() {
	var element = "task_processing_state";
	var oldStateValue = "intent_prediction";
	var updatedChoiceLabel = "Intent processing";
	var updatedChoiceValue = AutoResolutionConstants.TASK_PROCESSING_STATE.INTENT_PROCESSING;
	
	deactivateChoiceRecords(AutoResolutionConstants.CONTEXT_TABLE_NAME, element, oldStateValue);
	addChoiceRecord(AutoResolutionConstants.CONTEXT_TABLE_NAME, element, updatedChoiceLabel, updatedChoiceValue);
	setChoiceSequenceForElement(AutoResolutionConstants.CONTEXT_TABLE_NAME, element, AutoResolutionConstants.TASK_PROCESSING_STATE);
}

/**
 * Adds a new choice record for  records with the same table name and choice value,
 * for all languages. Translations of choice records have different labels, but share 
 * the same choice value.
 * @param {string} tableName	the name of the table that the choice record is associated with
 * @param {string} element		the name of the table element with choices
 * @param {string} choiceLabel	the label of the choice
 * @param {string} choiceValue	the value of the choice
 * @return {void}
 */
function addChoiceRecord(tableName, element, choiceLabel, choiceValue) {
	var choiceGr = new GlideRecord("sys_choice");
	choiceGr.initialize();
	choiceGr.setValue("element", element);
	choiceGr.setValue("name", tableName);
	choiceGr.setValue("label", choiceLabel);
	choiceGr.setValue("value", choiceValue);
	choiceGr.setValue("language", "en");
	var choiceId = choiceGr.insert();

	if (gs.nil(choiceId))
		gs.error("Error inserting new choice record for element {0} with choice value {1} on table {2}", element, choiceValue, tableName);
	
	gs.info("Choice value {0} has successfully been inserted for element {1} on table {2}", choiceValue, element, tableName);
}

/**
 * Deactivates choice records for all records with the same table name and choice value,
 * for all languages. Translations of choice records have different labels, but share 
 * the same choice value.
 * @param {string} tableName	the name of the table that the choice record is associated with
 * @param {string} element		the name of the table element with choices
 * @param {value} choiceValue	the name of the choice
 * @return {void}
 */
function deactivateChoiceRecords(tableName, element, choiceValue) {
	var choiceGr = new GlideRecord("sys_choice");
	choiceGr.addQuery("name", tableName);
	choiceGr.addQuery("element", element);
	choiceGr.addQuery("value", choiceValue);
	choiceGr.query();
	choiceGr.setValue("inactive", true);
	choiceGr.updateMultiple();

	gs.info("Choice value {0} for element {1} on table {2} has been set to inactive", choiceValue, element, tableName);
}

/**
 * Sets the choice display order for a specified element in increments of 10, given the
 * choices ordered in an object
 * @param {string} tableName	the name of the table
 * @param {element} element		the name of the element on the table containing choices
 * @param {Object} orderedObj	an object with the choices for the element in ordered form
 */
function setChoiceSequenceForElement(tableName, element, orderedObj) {
	var orderNumber = 10;
	for (var state in orderedObj) {
		var choiceGr = new GlideRecord("sys_choice");
		choiceGr.addQuery("name", tableName);
		choiceGr.addQuery("element", element);
		choiceGr.addQuery("value", orderedObj[state]);
		choiceGr.query();
		choiceGr.setValue("sequence", orderNumber);
		choiceGr.updateMultiple();
		orderNumber += 10;
	}

	gs.info("The choice sequence has been updated for the element {0} on the table {1}, with the order: {2}", 
		element, tableName, Object.keys(orderedObj).toString());
}
