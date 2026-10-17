(function executeRule(current, previous /*null when async*/) {
	if (current.isNewRecord()){
		var gdt = new GlideDateTime();
		current.start_time = gdt.getInternalFormattedLocalTime();
		gdt.addSeconds(3600);
		current.end_time = gdt.getInternalFormattedLocalTime();
	}

})(current, previous);
