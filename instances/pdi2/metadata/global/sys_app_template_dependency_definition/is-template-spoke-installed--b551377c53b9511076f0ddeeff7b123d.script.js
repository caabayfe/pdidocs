//is a specific spoke defined on a template installed?
(function(input) {
	if (!input.hasOwnProperty("scope_name"))
		return false;
	
    var gr = new GlideRecord("sys_scope");
    gr.addQuery("scope", input.scope_name);
    gr.addActiveQuery();
    gr.query();

    return gr.hasNext();

})(input);
