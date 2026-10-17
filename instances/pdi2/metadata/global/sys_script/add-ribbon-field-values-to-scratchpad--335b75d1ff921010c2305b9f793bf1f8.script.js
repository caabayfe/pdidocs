(function executeRule(current, previous /*null when async*/) {
	// 1. table && ribbon.table needs to be the same, 
	// 2. when ribbon is set/change on the form, we set width to ribbon.width
	// 3. cache ribbon.table & ribbon.width values in scratchpad, so client script can reuse them
	var ribbonTables = {};
	var ribbonWidths = {};
	if (!current.ribbon.nil()) {
		var ribbonRecord = current.ribbon.getRefRecord();
		if (!ribbonRecord.isValidRecord()) {
			current.getElement('ribbon').setError('Invalid reference');
			ribbonTables[current.ribbon] = '';
			ribbonWidths[current.ribbon] = '2';
		}
		else {
			ribbonTables[current.ribbon] = ribbonRecord.getValue('table');
			ribbonWidths[current.ribbon] = ribbonRecord.getValue('width');
			if (current.isNewRecord()) {
				current.setValue('table', ribbonRecord.getValue('table'));
				current.setValue('width', ribbonRecord.getValue('width'));
			}
		}		
	}
	g_scratchpad.ribbonTables = ribbonTables;
	g_scratchpad.ribbonWidths = ribbonWidths;
})(current, previous);
