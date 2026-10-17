function onLoad() {
	var fieldObj = g_form.$private.getField("training_language");
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
	g_form.setValue('training_language', JSON.stringify({selectedItems: originalJSON['selectedItems']}));
}
