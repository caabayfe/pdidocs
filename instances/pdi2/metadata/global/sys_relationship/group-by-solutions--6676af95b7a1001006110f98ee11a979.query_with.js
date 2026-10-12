(function refineQuery(current, parent) {
	var ver = parent.current_solution_version;
	var gr = new GlideRecord(parent.sys_class_name + "_groupby");
	gr.addQuery("solution_definition",parent.getUniqueValue());
	gr.query();
	var grpList = [];
	while(gr.next()){
		grpList.push(gr.getValue("solution_name"));
	}
	current.addQuery('solution_name', 'IN', grpList);

})(current, parent);
