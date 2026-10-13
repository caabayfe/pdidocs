(function executeRule(current, previous /*null when async*/) {

	var scheduleSysId = current.schedule + '';
	var scheduleGlideRecord = new GlideRecord('sysauto_script');

	scheduleGlideRecord.get(scheduleSysId);
	scheduleGlideRecord.deleteRecord();

})(current, previous);
