function transform(params) {
	var updatedByAI = false;

	if(!params || gs.nil(params.kb_sys_id)) {
		return {
			updatedByAI: updatedByAI
		};
	}

    var gr = new GlideRecordSecure('kb_operation_history_article');
    gr.addQuery('article', params.kb_sys_id);
    gr.addQuery('revert_status', 'IN', 'pending,failed');
    gr.addQuery('operation_history.operation_type', 'auto_update');
    gr.setLimit(1);
    gr.query();

    if (gr.next()) {
        updatedByAI = true;
    }

    return {
        updatedByAI: updatedByAI
    };

}
