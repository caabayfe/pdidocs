var gr = new GlideRecord('sys_rest_message_fn');
gr.addNullQuery('http_method');
gr.query();
while (gr.next()){
	if (!gr.function_name.nil() && 
		 ((gr.function_name == 'get') || (gr.function_name == 'put') || 
		  (gr.function_name == 'delete') || (gr.function_name == 'post'))){
	  	gr.setWorkflow(false);
		gr.setUseEngines(false);
		gr.http_method = gr.function_name;
		gr.update();
	}
}
