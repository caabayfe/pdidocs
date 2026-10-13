(function refineQuery(current, parent) {
	var callerId = parent.opened_for + "";
	var openedDate = parent.opened_at;
	var daysByProp = parseInt(gs.getProperty("glide.new_call.interaction.records_age",7));
	if(JSUtil.notNil(callerId) && daysByProp>0 ){
		var gdt = new GlideDateTime(openedDate);
		var toDate = gdt.getValue();
		
		gdt.addDays(-1*daysByProp + 1);
		
		var fromDate = gdt.getDate() + " 00:00:00";
		
		var fromToDateQuery = "opened_atBETWEEN" + fromDate + "@" + toDate;

		current.addEncodedQuery(fromToDateQuery + "^caller=" + callerId);
	}
	else
		current.addEncodedQuery("sys_idISEMPTY");
	
})(current, parent);
