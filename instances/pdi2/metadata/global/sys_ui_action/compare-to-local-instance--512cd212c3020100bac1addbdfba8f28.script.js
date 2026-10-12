function compareToLocalInstance(control) {
	var ajaxHelper = new GlideAjax('HubAjaxProcessor');
	ajaxHelper.addParam('sysparm_type', 'compareToLocalInstance');
	ajaxHelper.addParam('sys_id', rowSysId);
	ajaxHelper.getXMLAnswer(compareToLocalInstanceResponse);
}
function compareToLocalInstanceResponse(answer) {
	if (answer == null) {
			return;
	}
	var returnedIds = answer.split(',');
	var workerId = returnedIds[0];
	var syncId = returnedIds[1];

	var map = new GwtMessage().getMessages(["Close", "Compare to local instance"]);
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "10.5em");
	dd.setTitle(map["Compare to local instance"]);
	dd.setPreference('sysparm_renderer_execution_id', workerId);
	dd.setPreference('sysparm_renderer_expanded_levels', '0'); // collapsed root node by default
	dd.setPreference('sysparm_renderer_hide_drill_down', true);
	dd.setPreference('focusTrap', true);
		
	dd.setPreference('sysparm_button_close', map["Close"]);
	dd.on("executionComplete", function(trackerObj) {
		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.enable();
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
		if (trackerObj.state == "2") {
			var url = 'open_sync_results.do?table=sys_sync_preview' + '&sys_id=' + syncId;
			window.location.replace(url);
		}
	});
		
	dd.render();

}
