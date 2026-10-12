function openEditArticleForm() {
	var id = "";
	if (typeof g_form != "undefined"){
		id = g_form.getValue("feedback.article");
		window.open("/kb_knowledge.do?sys_id="+id);	
	}
}
