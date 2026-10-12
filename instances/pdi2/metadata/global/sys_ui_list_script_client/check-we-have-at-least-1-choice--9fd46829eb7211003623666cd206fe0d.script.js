function onSubmit() {
	var questionChoicesList = GlideList2.getListsForTable("sc_ic_question_choice");
	for (var i = 0; i < questionChoicesList.length; i++)
		g_form.hideFieldMsg(questionChoicesList[i].getContainer());

	var choiceCount = g_list.getRowCount();
	var questionType = g_form.getValue("base_type");
	var preconfigured = g_form.getValue("preconfigured");
	
	if (choiceCount != "0")
		return true;
	
	if (preconfigured != "true" && (questionType == "3" || questionType == "5")) {
		for (var i = 0; i < questionChoicesList.length; i++)
			g_form.showFieldMsg(questionChoicesList[i].getContainer(), "For this Type and Option you need to have at least 1 choice defined", "info");
		return false;
	}
	
	return true;
}
