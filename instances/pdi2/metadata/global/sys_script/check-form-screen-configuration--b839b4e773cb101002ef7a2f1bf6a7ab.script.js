(function executeRule(current, previous /* null when async */) {
	var dynamicMode = 'dynamic';
	var formSegmentTable = 'sys_sg_form_segment';
	var formScreenColumnName = 'form';
	var dynamicSegmentProtection = new DynamicSegmentProtection();

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
		while (formSegmentGR.next()) {
			if (formSegmentGR.sys_class_name == formSegmentTable && segmentRecord.sys_id != formSegmentGR.sys_id) {
                var message = gs.getMessage('Misconfiguration found in {0}: {1}.', [formSegmentTable, formSegmentGR.sys_id]);
                dynamicSegmentProtection.checkStaticSegment(formSegmentGR, index, message);
            }

           index++;
		}
	}
})(current, previous);
