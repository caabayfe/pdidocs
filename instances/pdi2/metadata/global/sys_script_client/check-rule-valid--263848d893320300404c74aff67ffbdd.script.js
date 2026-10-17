function onSubmit() {
	
   //Type appropriate comment here, and begin script below
   var manadatoriesFields = ["name","order","alert_filter"];
	for (var index = 0; index < manadatoriesFields.length; index++) {
		var fieldName = manadatoriesFields[index];
		var testFieldValue = g_form.getValue(fieldName);
		if (testFieldValue == '' || testFieldValue == null) {
			var fieldLabel = g_form.getLabelOf(fieldName);
			g_form.clearMessages();
			var msg = ("The following mandatory field is not filled in: {0} ").replace('{0}',fieldLabel);
			g_form.addErrorMessage(msg);
			return false;
		}
	}
	
	var submit_counter = g_form.getValue("submit_counter");
	g_form.setValue('em_alert_management_rule.submit_counter',Number(submit_counter) + 1);


}
