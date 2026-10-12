function transform(input) {
	var gr = new GlideRecord("sys_api_access_scope");
	gr.addQuery("apply_all_methods", true);
	gr.addQuery("apply_all_resources", true);
	gr.addQuery("apply_all_versions", true);
	gr.query();
	
	var answer = {};
	while(gr.next()) {
		var apiPath = gr.getValue("api_path") + "(" + gr.getValue("api") + ")";
        var scope = gr.getValue("auth_scope");
		answer[apiPath] = scope;
	}
	
	return answer;
}
