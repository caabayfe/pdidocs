(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var endTime = current.getValue('end_time')
    var sourceInstance = current.getValue('source_instance');
    
	var gdt = new GlideDateTime(endTime);
    var month = gdt.getMonthLocalTime();
    var day = gdt.getDayOfMonthLocalTime();
    var year = gdt.getYearLocalTime();
    // Convert numeric month to short month name
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var formattedDate = monthNames[month - 1] + " " + day + ", " + year;

    gs.info(formattedDate); // Output: Jan 23, 2025
    var lastClone = formattedDate + " Source: " + sourceInstance;
    

	var instanceId = gs.getProperty('instance_id');
    var gr = new GlideRecord('sn_um_instance_status');
    gr.addQuery('instance_id', instanceId);
    gr.query();
    if (gr.next()) {
		gs.info("Updating last_clone to: " + lastClone);
        gr.setValue('last_clone', lastClone);
        gr.update();
    }

})(current, previous);
