function promptForRejectionReasonListV3() {
	var dialog = new GlideModal('sn_major_inc_mgmt_mim_rejection_reason_list');
	var listID = g_list.listID;
	var selectedIncidents = g_list.getChecked();
	var url = new GlideURL(location.href);
	var param = url.getParam('sysparm_query');
	param = decodeURIComponent(param);
	g_i18n.getMessage('Rejection Reason', function(msg) {
		dialog.setTitle(msg);
		var link = "sn_major_inc_mgmt_mim_rejection_reason_list.do?selected_incidents="+selectedIncidents;
		dialog.renderIframe(link, function(){
			this.parent.jQuery('#sn_major_inc_mgmt_mim_rejection_reason_list').find("iframe").height("143");
			this.parent.jQuery('#sn_major_inc_mgmt_mim_rejection_reason_list').find(".modal-content").height("200");
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
			var incidentUrl = "";
			var incidentLink = "";
			rejectedIncidents.forEach(function(value, index) {
					g_i18n.getMessage("Major Incident candidate {incident_display} has been rejected", function(message) {
					incidentUrl = new GlideURL('incident.do');
					incidentUrl.addParam('sys_id', value.value);
					incidentLink = "<a href=" + incidentUrl.getURL() + ">" + value.key + "</a>";
					g_notification.show("info", g_i18n.format(message, {
						"incident_display": incidentLink,
					}));
				});
			});
		}
		GlideList.get(listID).setFilterAndRefresh(param);
		dialog.destroy();
	});
	dialog.on('beforeclose', function(){
		CustomEvent.unAll("mi.rejectMIC.cancel");
		CustomEvent.unAll("mi.rejectMIC.confirm");
	});
}
