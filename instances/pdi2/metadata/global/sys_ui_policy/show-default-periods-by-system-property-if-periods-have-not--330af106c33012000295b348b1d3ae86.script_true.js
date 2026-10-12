function onCondition() {
	var cube = g_form.getValue('cube');
	
	var ga = new GlideAjax('PAAjax');
	ga.addParam('sysparm_name','getDefaultScorePeriod');
	ga.addParam('sysparm_cube', cube);
	ga.getXMLWait();
	var scorePeriods = ga.getAnswer();
	
	ga = new GlideAjax('PAAjax');
	ga.addParam('sysparm_name','getDefaultSnapshotPeriod');
	ga.addParam('sysparm_cube', cube);
	ga.getXMLWait();
	var snapPeriods = ga.getAnswer();
	
	g_form.setValue('score_periods', scorePeriods);
	g_form.setValue('snapshot_periods', snapPeriods);
}
