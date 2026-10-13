function showSelectMajorIncidentDialog() {
	var title = g_list.getTitle();
	var listID = g_list.listID;
	var incidents = g_list.getChecked().toString();
	if (incidents) {
		var url = new GlideURL(location.href);
		var param = url.getParam('sysparm_query');
		param = decodeURIComponent(param);
		var glideUrl = GlideURLBuilder.newGlideUrl("sn_major_inc_mgmt_select_major_incident_dialog_ui.do");
		glideUrl.addParam('selected_incidents', incidents);
		glideUrl.addParam('table_label', title);
		glideUrl.addParam("sysparm_nostack", "no");

		var o = new GlideModal("sn_major_inc_mgmt_select_major_incident_dialog_ui", false, "modal-md", "");
		g_i18n.getMessage("Choose a Major Incident", function(msg) {
			o.setTitle(msg);
			o.renderIframe(glideUrl.getURL(), function() {
				this.parent.jQuery('#sn_major_inc_mgmt_select_major_incident_dialog_ui').find("iframe").height("160");
				this.parent.jQuery('#sn_major_inc_mgmt_select_major_incident_dialog_ui').find(".modal-content").height("210");
			});
		});

		CustomEvent.observe("mi.addToExisting.associate", function(answer) {
			if (answer) {
				var ans = answer[0];
				g_i18n.getMessage("Selected {incident_name} were added as child Incidents to Major Incident {incident_display}", function(message) {
					var incidentUrl = new GlideURL('incident.do');
					incidentUrl.addParam('sys_id', ans.getAttribute('incidentId'));
					var incidentLink = "<a href=" + incidentUrl.getURL() + ">" + ans.getAttribute('displayValue') + "</a>";
					g_notification.show("info", g_i18n.format(message, {
						"incident_name": title,
						"incident_display": incidentLink,
					}));
				});
			}

			GlideList.get(listID).setFilterAndRefresh(param);
			o.destroy();
		});

		CustomEvent.observe("mi.addToExisting.cancel", function() {
			o.destroy();
		});

		o.on('beforeclose', function() {
			CustomEvent.unAll("mi.addToExisting.cancel");
			CustomEvent.unAll("mi.addToExisting.associate");
		});
	}
}
