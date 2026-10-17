function onCondition() {
	var relatedList = GlideList2.getListsForTable("sc_ic_question_choice");
	for (var i = 0; i < relatedList.length; i++)
		//relatedList[i].getContainer().style.visibility = "hidden";
		relatedList[i].getContainer().style.display = "none";
}
