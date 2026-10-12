(function executeRule(current, previous /*null when async*/) {

	var datasource = new GlideRecord("ais_datasource");
	datasource.get(current.getValue("datasource"));
	current.setValue("sys_name", datasource.source + "." + current.getValue("field"));

})(current, previous);
