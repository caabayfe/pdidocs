(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_embedded_tour_guide");
	gr.addQuery("context", "$pa_dashboard");
	gr.query();
	if (gr.next()) {
		//if property is deleted then previous.isValidRecord() is false 
		var value = previous.isValidRecord() ? current.getValue("value") : true;
		gr.setValue("active", value);
		gr.update();
	}
})(current, previous);
