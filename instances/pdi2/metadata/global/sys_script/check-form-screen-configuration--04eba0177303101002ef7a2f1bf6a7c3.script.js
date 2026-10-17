(function executeRule(current, previous /* null when async */) {
	var dynamicMode = 'dynamic';
	var formSegmentTable = 'sys_sg_form_segment';
	var formScreenColumnName = 'form';
	var dynamicSegmentProtection = new DynamicSegmentProtection();

	var mode = dynamicSegmentProtection.defineConfigurationMode(current.sys_class_name, current.sys_id);
	if (mode == dynamicMode)
		checkDynamicConfiguration(current);

	function checkDynamicConfiguration(formScreenGR) {
		var orderColumn = 'order';
		var formSegmentGR = new GlideRecord(formSegmentTable);
		formSegmentGR.addQuery(formScreenColumnName, formScreenGR.sys_id);
		formSegmentGR.orderBy(orderColumn);
		formSegmentGR.query();
		var index = 0;
		while (formSegmentGR.next()) {
			if (formSegmentGR.sys_class_name == formSegmentTable) {
				var message = gs.getMessage('Misconfiguration found in {0}: {1}.', [formSegmentTable, formSegmentGR.sys_id]);
				dynamicSegmentProtection.checkStaticSegment(formSegmentGR, index, message);
			}

			index++;
		}
	}
})(current, previous);
