var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name', 'ecc_agent_ext_context_webserver');
gr.addQuery('element', 'secure_connection');
gr.query();
if(gr.next()){
		gr.default_value = true;
		gr.update();
		gs.info("Default Value of Secure Connection is set to true.");
}
else{
	gs.info("Record not found with given element = secure_connection and name = ecc_agent_ext_context_webserver in sys_dictionary table");
}
