(function () {
	gs.info('Deprecating legacy sys_trigger: "Calculate Availability"');
	var availTrigger = new GlideRecord('sys_trigger');
	if (availTrigger.get('402cdf0c0a0a0b2b0029bfaea25969f3')) {
		var availJob = new GlideRecord('sysauto_script');
		availJob.get('745b9b7743dd2110a6dfaff3fab8f226');
		availJob.setValue('time_zone', availTrigger.time_zone);
		availJob.setValue('run_time', availTrigger.run_time);
		availJob.update();
		availTrigger.deleteRecord();
	}
})();
