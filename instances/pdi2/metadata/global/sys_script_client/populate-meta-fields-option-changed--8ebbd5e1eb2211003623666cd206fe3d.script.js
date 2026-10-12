function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == "") {
		g_form.setValue("base_type","");
		g_form.setValue("read_only_question_type",false);
		g_form.setValue("preconfigured",false);
		hideShowChoicesLists();
		return;
	}
	
	// Lookup values from the question type.
	var questionType = new GlideRecord("sc_ic_question_type");
	if (questionType.get(newValue) && !isLoading) {
		g_form.setValue("base_type",parseInt(questionType.sc_ic_question_class));
		g_form.setValue("read_only_question_type",(questionType.read_only == 'true'));
		g_form.setValue("preconfigured",(questionType.preconfigured == 'true'));
		if (questionType.preconfigured == 'true') {
			g_form.setValue("question_text", questionType.question_text);
			g_form.setValue("help_text", questionType.help_text);
		} else {
			g_form.clearValue("question_text");
			g_form.clearValue("help_text");
		}
	}
	
	hideShowChoicesLists();
}

function hideShowChoicesLists() {
	var questionClass = g_form.getValue('base_type');
	var preconfigured = g_form.getValue('preconfigured');
	var questionType = g_form.getValue('sc_ic_question_type');

	var showList = ((questionClass == "3" || questionClass == "5") && questionType != "");
	
	var questionChoicesList = GlideList2.getListsForTable("sc_ic_question_choice");
	for (var i = 0; i < questionChoicesList.length; i++) {
		g_form.hideFieldMsg(questionChoicesList[i].getContainer());
		showList && preconfigured != "true" ? show(questionChoicesList[i].getContainer()) : hide(questionChoicesList[i].getContainer());
	}
	
	var questionTypeChoicesList = GlideList2.getListsForTable("sc_ic_question_type_choice");
	for (var i = 0; i < questionTypeChoicesList.length; i++) {
		if (showList && preconfigured == "true") {
			questionTypeChoicesList[i].setFilterAndRefresh("sc_ic_question_type=" + questionType);
			show("list_nav_" + questionTypeChoicesList[i].listID)
			show(questionTypeChoicesList[i].listID)
		} else {
			hide("list_nav_" + questionTypeChoicesList[i].listID)
			hide(questionTypeChoicesList[i].listID);
		}
	}
}
