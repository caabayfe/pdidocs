function execute() {	
	var ga = new GlideAjax('ScanAjaxProcessor');
	ga.addParam('sysparm_name', 'executeAppScan');
	ga.addParam('sysparm_scope_id', g_form.getUniqueValue());
	ga.getXML(renderProgress);
}

function renderProgress(response) {
	ScriptLoader.getScripts('/scripts/ScanProgressViewerUtil.js', function() {
		var scanTitle = new GwtMessage().getMessage('Execute Application Scan');
		var hspvUtil = new ScanProgressViewerUtil();
		hspvUtil.renderProgress(response, scanTitle);
	});
}
