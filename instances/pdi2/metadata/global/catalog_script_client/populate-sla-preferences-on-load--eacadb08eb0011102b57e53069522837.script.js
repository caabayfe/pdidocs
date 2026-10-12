function onLoad() {
	var fieldObj = g_form.$private.getField("sla_preferences");
    var originalValue = fieldObj.value || '';
    var originalJSON;
    try {
        originalJSON = JSON.parse(originalValue);
    } catch (e) {
        originalJSON = {};
    }

    var internalObj = {};
    internalObj['title'] = originalJSON['title'];
	internalObj['description'] = originalJSON['description'];

    fieldObj._internalObj = internalObj;
	g_form.setValue('sla_preferences', JSON.stringify({sla: originalJSON['sla']}));
   
}
