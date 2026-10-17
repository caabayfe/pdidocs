var gr = new GlideRecord('ml_solution');
gr.addEncodedQuery('active=true^solution_definition=' + current.sys_id);
gr.query();
if (gr.next()) {
	var url = 'ml_similarity_example_list.do?';
	url += 'sysparm_query=solution='+gr.sys_id;
	url += '^ORDERBYDESCsimilarity_score';
	action.setRedirectURL(url);
}
