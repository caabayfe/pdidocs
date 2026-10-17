function transform(params) {
    if (gs.nil(params.source_sys_id) || gs.nil(params.kb_sys_id) || params.kb_sys_id != '-1') {
        return {
            success: false
        };
	}
	
    var answer = new global.KMRecordPageUtils().getEmbeddedQueries(params.source_sys_id);
    return {
        success: true,
        content: answer
    };
}
