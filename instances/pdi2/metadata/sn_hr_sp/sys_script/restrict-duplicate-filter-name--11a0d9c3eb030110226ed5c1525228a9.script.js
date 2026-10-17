(function executeRule(current, previous /*null when async*/) {

	var todoFilterLabelGr = new GlideRecord("sn_ex_sp_todo_filter");
	todoFilterLabelGr.addQuery("name",current.getValue("name"));
	todoFilterLabelGr.addQuery("sys_id","!=",current.sys_id); 
	todoFilterLabelGr.query();
	if(todoFilterLabelGr.next())
	{
		gs.addErrorMessage(gs.getMessage("{0} : {1} already exists.",[current.getElement("name").getLabel(), current.getDisplayValue("name")]));
		current.setAbortAction(true);
	}

})(current, previous);
