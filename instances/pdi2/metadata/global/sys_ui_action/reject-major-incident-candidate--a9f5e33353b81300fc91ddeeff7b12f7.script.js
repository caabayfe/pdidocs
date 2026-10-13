function promptForRejectionReasonList() {
	var dialog = new GlideModal('sn_major_inc_mgmt_mim_rejection_reason_list');
	var listID = g_list.listID;
	var selectedIncidents = g_list.getChecked();
	getMessage('Rejection Reason', function(msg) {
		dialog.setTitle(msg);
		dialog.setPreference("selected_incidents", selectedIncidents);
		ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
			dialog.template = glideModalTemplate;
			dialog.on('bodyrendered', function(event) {
				glideModalKeyDownHandler(event, dialog.getID());
			});
			dialog.render();
		});
	});
	CustomEvent.observe('mi.rejectMIC.cancel', function() {
		dialog.destroy();
	});
	CustomEvent.observe('mi.rejectMIC.confirm', function(answer) {
		if (answer) {
			var ans = answer[0];
			var rejectedIncidents = JSON.parse(ans.getAttribute("rejectedIncidents"));
			var rejectedCount = ans.getAttribute("rejectedCount");
			var url = "";
			var incidentLink = "";
			rejectedIncidents.forEach(function(value, index) {
				url = new GlideURL('incident.do');
				url.addParam('sys_id', value.value);
				incidentLink = "<a href=" + url.getURL() + ">" + value.key + "</a>";
				GlideUI.get().addOutputMessage({
					msg: new GwtMessage().getMessage('Major Incident candidate {0} has been rejected', incidentLink),
						type: "info"
					});
			});
		}
		var checkedIds = selectedIncidents.split(',');
		for (var i = 0; i < checkedIds.length; i++)
			$('check_' + listID + '_' + checkedIds[i]).checked = false;
		$("allcheck_" + listID).checked = false;
		dialog.destroy();
	});
	dialog.on('beforeclose', function(){
		CustomEvent.unAll("mi.rejectMIC.cancel");
		CustomEvent.unAll("mi.rejectMIC.confirm");
	});
}
