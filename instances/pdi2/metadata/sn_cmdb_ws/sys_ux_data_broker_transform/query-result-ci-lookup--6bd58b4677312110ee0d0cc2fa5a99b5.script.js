function transform(input) {
	var table = input.table;
	var recordId = input.recordId;
	var returnFields = input.returnFields;
	var gr = new GlideRecord(table);
	if (gr.get(recordId)) {
		return {primaryCiColumn: gr.getValue(returnFields)};
	}
	return {primaryCiColumn: ''};
}
