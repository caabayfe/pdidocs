function showProgress() {	
	var map = new GwtMessage().getMessages(['Execute Full Scan']);
	var resultId = (typeof rowSysId == 'undefined')? g_form.getUniqueValue() : rowSysId;
	var scan = new GlideRecord('scan_result');
	scan.addQuery('sys_id', resultId);
	scan.query();
	scan.next();
	var workerId = scan.getValue('progress_id');	
	
	ScriptLoader.getScripts('/scripts/ScanProgressViewerUtil.js', function() {
		var hspvUtil = new ScanProgressViewerUtil();
		hspvUtil.renderProgressViewer(map['Execute Full Scan'], workerId);
	});
}
