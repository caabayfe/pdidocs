function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		addAfterPageLoadedEvent(hideShowChoicesLists);
	else
		hideShowChoicesLists();

	if (newValue == oldValue && !g_form.isNewRecord())
		return;

	var questionAjax = new GlideAjax("sc_ic_QuestionAJAX");
	questionAjax.addParam("sysparm_name", "getDefaultQuestionType");
	questionAjax.addParam("sysparm_sc_ic_question_class", newValue);
	questionAjax.getXMLWait();
	
	var questionTypeIds = questionAjax.getAnswer();
	if (questionTypeIds == "")
		return;
	
	var questionTypeIdsArr = questionTypeIds.split(",");
	if (questionTypeIdsArr.length == 1) {
		g_form.setValue("sc_ic_question_type", questionTypeIdsArr[0]);
		g_form.setReadonly("sc_ic_question_type",true);
	} else {
		g_form.clearValue("sc_ic_question_type");		
		g_form.setReadonly("sc_ic_question_type",false);
	}
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
			questionTypeChoicesList[i].setFilter("sc_ic_question_type=" + questionType);
			questionTypeChoicesList[i].refresh();
			show("list_nav_" + questionTypeChoicesList[i].listID)
			show(questionTypeChoicesList[i].listID)
		} else {
			hide("list_nav_" + questionTypeChoicesList[i].listID)
			hide(questionTypeChoicesList[i].listID);
		}
	}
}
