function openDialogAddCategoryFromBank() {
	var dialog = new GlideModal('asmt_question_bank_list');
	dialog.setTitle(getMessage("New Category from Bank"));
	dialog.setWidth(1200);
	dialog.setAutoFullHeight(true);
	dialog.on('beforeclose', function(){
		var listId = g_form.getTableName() + ".asmt_metric_category.metric_type";
		var GlideList = GlideList2 ? GlideList2 : GlideList;
		var list = GlideList.get(listId);
		if (list)
			list.refresh();
	});
	var url = new GlideURL('asmt_question_bank_list.do');
	url.addParam('sysparm_action', 'add_category_from_bank');
	url.addParam('sysparm_query', "qb_evaluation_method=" + g_scratchpad.evaluation_method);
	url.addParam('sysparm_record_id', g_form.getUniqueValue());
	url.addParam('sysparm_stack', 'no');
	dialog.renderIframe(url.getURL(), function(event) {});
}
