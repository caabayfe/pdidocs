function transform(params) {
	var result = [];
	var gr = new GlideRecordSecure('sys_user');

	gr.addQuery('name', 'STARTSWITH', params.user_name).addOrCondition('user_name', 'STARTSWITH', params.user_name);
	gr.orderBy('name');
	
	if(!params.user_name ){
		gr.setLimit(10);
	}
	gr.query();
	while (gr.next()) {
		result.push({
			id: gr.getUniqueValue(),
			label: gr.getValue('name'),
			sublabel: gr.getValue('email'),
		});
	}
	return result;
}
