function onCondition() {
	var msg = "'Choice[sys_choice]' is not a valid reference field target. Select another table.";
	getMessage(msg, function(translated) {
		g_form.addWarningMessage(translated, "amay_choice_prevention");
	});
}
