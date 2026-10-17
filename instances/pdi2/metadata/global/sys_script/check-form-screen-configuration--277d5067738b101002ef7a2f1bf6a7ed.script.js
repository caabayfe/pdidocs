(function executeRule(current, previous /* null when async */) {
	var dynamicMode = 'dynamic';
	var formSegmentTable = 'sys_sg_form_segment';
	var dynamicFormSegmentTable = 'sys_sg_dynamic_form_segment';
	var formScreenColumnName = 'form';
	var dynamicSegmentProtection = new DynamicSegmentProtection();

	if (current.sys_class_name == dynamicFormSegmentTable)
		return;

	var mode = dynamicSegmentProtection.defineConfigurationMode(current.sys_class_name, current.form);
	if (mode == dynamicMode)
		checkConfiguration(current);

	function checkConfiguration(segmentRecord) {
		var orderColumn = 'order';
		var formSegmentGR = new GlideRecord(formSegmentTable);
		formSegmentGR.addQuery(formScreenColumnName, segmentRecord.form);
		formSegmentGR.orderBy(orderColumn);
		formSegmentGR.query();
		var index = 0;
		var checkSegmentOrder = segmentRecord.order;
		while (formSegmentGR.next()) {
			if ((segmentRecord.sys_id == formSegmentGR.sys_id) || (checkSegmentOrder < formSegmentGR.order))
				break;

			index++;
		}

		var isSuccessful = dynamicSegmentProtection.checkStaticSegment(segmentRecord, index, '');
		if (!isSuccessful)
			current.setAbortAction(true);
	}
})(current, previous);
