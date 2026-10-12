(function executeRule(current, previous /*null when async*/) {

	var addedInputFields = getAddedInputFields(current, previous);
	//Below field types are supported for the input fields
	var fieldTypesName = "choice,string,html,reference,integer,long,longint,decimal,numeric,float,boolean";
	var fieldTypesLabel = "Choice, String, HTML, Reference, Integer, Long, Longint, Decimal, Numeric, Float, Boolean";
	var validInputTypes = checkInputTypes(current.table, addedInputFields, fieldTypesName);
	if (!validInputTypes) {
		var inputErrorMessage = gs.getMessage("Input Fields are only supported for {0} types", fieldTypesLabel.toString());
        gs.addErrorMessage(inputErrorMessage);
		current.setAbortAction(true);
    }

})(current, previous);

function checkInputTypes(table, addFields, fieldTypes) {
    var tableRecord = new GlideRecord(table);
    for (var field in addFields) {
        var element = tableRecord.getElement(addFields[field]);
        var descriptor = element.getED();
        var type = descriptor.getInternalType();
        var choiceType = sn_ml.MLRecordUtil.getFieldType(table, addFields[field]);
        if (!fieldTypes.includes(type) && !fieldTypes.includes(choiceType)) {
            return false;
        }
    }
    return true;
}

function getAddedInputFields(current, previous) {
    var currentArray = current.fields.split(',');
    if (gs.nil(previous.fields)) {
        return currentArray;
    }
    var previousArray = previous.fields.split(',');
    return currentArray.filter(function(x) {
        return previousArray.indexOf(x) < 0;
    });
}
