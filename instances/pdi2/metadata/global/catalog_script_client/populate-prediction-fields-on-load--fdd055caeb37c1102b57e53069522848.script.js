function onLoad() {
   //Type appropriate comment here, and begin script below
   var fieldObj = g_form.$private.getField("prediction_fields");
    var originalValue = fieldObj.value || '';
    var originalJSON;
    try {
        originalJSON = JSON.parse(originalValue);
    } catch (e) {
        originalJSON = {};
    }

    var internalObj = {};
    internalObj['placeholderText'] = originalJSON['placeholderText'];
	internalObj['listItems'] = originalJSON['listItems'];
	internalObj['label'] = originalJSON['label'];
	internalObj['required'] = originalJSON['required'];
	
    fieldObj._internalObj = internalObj;
	g_form.setValue('prediction_fields', JSON.stringify({selectedItems: originalJSON['selectedItems']}));
}
