(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sys_nlu_model");
	gr.addQuery("primary_model", current.sys_id);
	gr.query();
	while(gr.next()){
		gr.setValue("display_name", current.display_name+ ' '+ gr.language.toUpperCase());
		gr.update();
	}		

})(current, previous);
