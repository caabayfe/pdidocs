function onLoad() {
	var display = function(arrFields) {
		_toggleFields(arrFields, true);
	};

	var hide = function(arrFields) {
		_toggleFields(arrFields, false);
	};

	var _toggleFields = function(arrFields, isDisplay) {
		arrFields.map(function(fieldName) {
			g_form.setDisplay(fieldName, isDisplay);
		});
	};
	
	var sourceType = g_form.getValue("source_type");
	if (sourceType === "email") {
		g_form.clearValue("phone_number_source");
		display(["table", "email_source"]);
		hide(["phone_number_source"]);
	}
	else if (sourceType === "phone_number") {
		g_form.clearValue("email_source");
		display(["table", "phone_number_source"]);
		hide(["email_source"]);
	}
	else if (sourceType === "mobile_notification") {
		g_form.setMandatory("table", false);
		g_form.setMandatory("user_field", false);
		g_form.setMandatory("email_source", false);

		g_form.setValue("table", "sys_user"); // Default value

		g_form.clearValue("user_field");
		g_form.clearValue("email_source");
		g_form.clearValue("phone_number_source");

		hide(["table", "user_field", "email_source", "phone_number_source"]);
	}
}
