(function executeRule(current, previous /*null when async*/) {

	 if (current.context.sys_created_on){
		var end = new GlideDateTime(current.context.sys_created_on);
		end.add(new GlideTime(current.run_time));
		current.end = end;
    }
	else
		current.end = new GlideDateTime();

})(current, previous);
