var gr = new GlideRecord(global.MLBaseConstants.ML_SOLUTION);
gr.addActiveQuery();
gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, current.sys_id);
gr.query();
if (gr.next()) {
	var url = 'ml_similarity_example_list.do?';
	url += 'sysparm_query=solution='+gr.sys_id;
	url += '^ORDERBYDESCsimilarity_score';
	action.setRedirectURL(url);
}
