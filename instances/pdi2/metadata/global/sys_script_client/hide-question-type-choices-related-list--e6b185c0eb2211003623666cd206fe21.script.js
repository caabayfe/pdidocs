function onLoad() {
	addAfterPageLoadedEvent(function() {
		var questionClass = g_form.getValue('sc_ic_question_class');
		var showList = (questionClass == "3" || questionClass == "5");
		
		var relatedList = GlideList2.getListsForTable("sc_ic_question_type_choice");
		
		for (var i = 0; i < relatedList.length; i++)
			showList ? show(relatedList[i].getContainer()) : hide(relatedList[i].getContainer());
	});
}
