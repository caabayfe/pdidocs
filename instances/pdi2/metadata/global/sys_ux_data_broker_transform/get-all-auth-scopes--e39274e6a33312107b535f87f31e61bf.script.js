function transform(input) {
	var gr = new GlideRecord("sys_auth_scope");
	gr.query();
	var answer = [];
	while(gr.next()) {
		var scope = {};
		scope["label"] = gr.getValue("name");
		scope["sys_id"] = gr.getValue("sys_id");
		scope["id"] = gr.getValue("sys_id");
		answer.push(scope);
	}
	return answer;
}
