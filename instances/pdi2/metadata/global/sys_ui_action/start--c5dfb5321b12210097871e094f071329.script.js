function startFlow() {
	if (isMSIE8)
		g_form.modified = false;

	var $j = isMSIE8 ? window.top.jQuery : jQuery;

	var aj = new GlideAjax('com.glideapp.workflow.ui.WorkflowDiagramProcessor');
	aj.addParam('sysparm_type', 'start');
	aj.addParam('id', $j("input#wf_context\\.workflow_version", window.document).val());

	// add each of the input's name and value
	$j("[id^='wf_context\\.workflow\\.vars\\.']:input", window.document).each(function(idx, elm) {
		var el = $j(elm);
		aj.addParam(el.attr('id'), el.val());
	});

	aj.getXML(function(response) {
		$j(window).off('beforeunload');
		var contextId = $j(response.responseXML).find("result").text();
		window.location.href = "context_workflow.do?sysparm_sys_id=" + contextId;
	});

	return true;
}
