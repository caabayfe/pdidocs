
                        			function onCondition() {
    // Display Note for Evaluation Condition
	var evaluationConditionField = "interoperable_condition";
    getMessage("Only supports encoded queries with route fields", function(translatedMsg) {
		g_form.hideFieldMsg(evaluationConditionField, true);
        g_form.showFieldMsg(evaluationConditionField, translatedMsg);
    });
}
