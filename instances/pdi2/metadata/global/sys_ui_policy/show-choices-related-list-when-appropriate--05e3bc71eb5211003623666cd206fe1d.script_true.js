function onCondition() {
	var relatedList = GlideList2.getListsForTable("sc_ic_question_type_choice");
	for (var i = 0; i < relatedList.length; i++)
		relatedList[i].getContainer().style.display = "block";
}
