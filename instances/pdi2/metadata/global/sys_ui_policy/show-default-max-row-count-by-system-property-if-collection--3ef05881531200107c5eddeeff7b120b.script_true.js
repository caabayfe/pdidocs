function onCondition() {
	var ga = new GlideAjax('PAAjax');
	ga.addParam('sysparm_name', 'getMaxRowCountIndicatorSource');
	ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
	ga.getXMLWait();
	var maximumRecordFetchCount = ga.getAnswer();
	g_form.setValue('max_record_fetch_count', maximumRecordFetchCount);
}
