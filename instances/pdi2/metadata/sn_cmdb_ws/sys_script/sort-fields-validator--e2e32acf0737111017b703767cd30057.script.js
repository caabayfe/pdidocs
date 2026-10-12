(function executeRule(current, previous /*null when async*/) {
	// Sort fields should all be part of the existing number, title, header, and fields data.
	// If there is a mismatch the record is considered invalid
	var fields = current.fields;
	var sortFields = current.sort_fields;
	var fieldsArray = fields.split(",");
	fieldsArray.push(current.number_field + "");
	fieldsArray.push(current.title_field + "");
	if (current.footer_field) {
		fieldsArray.push(current.footer_field + "");
	}

	var sortArray = !sortFields ? [] : sortFields.split(",");
	for (var index = 0; index < sortArray.length; index++) {
		if (fieldsArray.indexOf(sortArray[index]) < 0) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Sort fields contains a field that does not exist in the record."));
		}
	}

})(current, previous);
