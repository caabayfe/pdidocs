function transform(params) {

	var result = [];
	var gr = new GlideRecordSecure('kb_knowledge_base');
	gr.query();

	while (gr.next()) {
		result.push({
			id: gr.getUniqueValue(),
			label: gr.getValue('title'),
		});
	}
	return result;
}
