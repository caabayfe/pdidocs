function openDialogAddMetricFromBank() {
	var dialog = new GlideModal('asmt_question_bank_list');
	dialog.setTitle(getMessage("New Metric from Bank"));
	dialog.setWidth(1200);
	dialog.setAutoFullHeight(true);
	dialog.on('beforeclose', function(){
		var listId = g_form.getTableName() + ".asmt_metric.category";
		var GlideList = GlideList2 ? GlideList2 : GlideList;
		var list = GlideList.get(listId);
		if (list)
			list.refresh();
	});
	var url = new GlideURL('asmt_question_bank_list.do');
	url.addParam('sysparm_action', 'add_metric_from_bank');
	url.addParam('sysparm_query', "category.qb_evaluation_method=" + g_scratchpad.evaluation_method);
	url.addParam('sysparm_record_id', g_list.getSubmitValue('sysparm_collectionID'));
	url.addParam('sysparm_stack', 'no');
	dialog.renderIframe(url.getURL(), function(event) {});
}
