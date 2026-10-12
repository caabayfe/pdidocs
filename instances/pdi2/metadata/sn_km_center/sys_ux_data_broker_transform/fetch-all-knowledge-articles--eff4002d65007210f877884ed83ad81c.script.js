function transform(params) {
	var result = [];
	var gr = new GlideRecordSecure('kb_knowledge');
	gr.addQuery('number', 'STARTSWITH', params.article_number);
	gr.orderBy('number');
	if(!params.article_number){
		gr.setLimit(10);
	}
	gr.query();
	while (gr.next()) {
		result.push({
			id: gr.getUniqueValue(),
			label: gr.getValue('display_number'),
		});
	}
	return result;
}
