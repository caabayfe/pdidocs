(function executeRule(current, previous /*null when async*/) {
	var antivirusActivityTbl = 'antivirus_activity';
	var activityGR = new GlideRecord(antivirusActivityTbl);
	activityGR.addQuery('attachment_id',current.sys_id);
	activityGR.addQuery('event','deleted');
	activityGR.query();
	if (activityGR.next())
		return;
	
	var existingActivityGR = new GlideRecord(antivirusActivityTbl);
	existingActivityGR.addQuery('attachment_id',current.sys_id);
	existingActivityGR.query();
	if (existingActivityGR.next()) {
		var gr = new GlideRecord(antivirusActivityTbl);
		gr.initialize();
		gr.event = 'deleted';
		gr.event_source = 'from_record';
		gr.event_time = new GlideDateTime();
		gr.event_by = gs.getUserID();
		gr.attachment_id = existingActivityGR.attachment_id;
		gr.file_name = existingActivityGR.file_name;
		gr.virus = existingActivityGR.virus;
		gr.table_name = existingActivityGR.table_name;
		gr.detected = existingActivityGR.detected;
		gr.uploader = existingActivityGR.uploader;
		gr.table_sys_id = existingActivityGR.table_sys_id;
		gr.virus_detected = existingActivityGR.virus_detected;
		gr.insert();
	}
})(current, previous);
