(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
	var result = [];
	var gr = new GlideRecord("sys_choice");
	gr.addQuery("name", "cmdb_ci");
	gr.addQuery("element", "environment");
	gr.addQuery("language", gs.getSession().getLanguage());
	gr.addQuery("inactive", false);
	gr.query();
	
	while(gr.hasNext()){
		gr.next();
		result.push({value: gr.getValue("value"), label: gr.getValue("label")});
	}

	response.setStatus(200);
	response.setBody(result);

})(request, response);
