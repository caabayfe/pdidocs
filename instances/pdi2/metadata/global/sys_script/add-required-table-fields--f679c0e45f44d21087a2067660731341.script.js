(function executeRule(current, previous /*null when async*/ ) {

    var condition = current.getValue('condition');

    var modelString = "model=";
    var modelIndex = condition.indexOf(modelString);
    if (modelIndex == -1)
        return;

    modelIndex += modelString.length;
    var model = condition.substring(modelIndex, modelIndex + 32);

    var fieldPrefix = 'columns.var__m_sys_search_genius_result_field_' + model;
    var expectedFields = [];
    expectedFields.push(fieldPrefix + ".__sys_id");
    expectedFields.push(fieldPrefix + ".sys_id");

    var fields = current.getValue('field_list');
	if (!fields)
		fields = [];
	else
		fields = fields.split(',');
	
    for (var field in expectedFields) {
        var expectedField = expectedFields[field];
        if (!fields.includes(expectedField)) {
            gs.addInfoMessage(gs.getMessage("Adding Required Field: {0}", expectedField));
            fields.push(expectedField);
        }
    }

    current.setValue('field_list', fields.join(","));
})(current, previous);
