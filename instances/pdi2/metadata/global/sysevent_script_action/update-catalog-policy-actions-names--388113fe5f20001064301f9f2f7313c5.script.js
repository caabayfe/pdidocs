(function() {
	var job = new GlideRecord('sysauto_script');
	if (job.get('name', 'Update catalog ui policy action names for variables and sets'))
		SncTriggerSynchronizer.executeNow(job);
}());
