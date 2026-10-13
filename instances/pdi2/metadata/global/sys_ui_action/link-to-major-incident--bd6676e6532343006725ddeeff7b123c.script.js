function showSelectMajorIncidentDialog() {
	var title = g_list.getTitle();
	var listID = g_list.listID;
	var incidents = g_list.getChecked().toString();
	if (incidents) {
		var o = new GlideModal('sn_major_inc_mgmt_select_major_incident_dialog_ui');
		ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
			getMessage("Choose a Major Incident", function(msg) {
				o.setTitle(msg);
				o.setPreference('selected_incidents', incidents);
				o.template = glideModalTemplate;
				o.on('bodyrendered', function(event) {
					glideModalKeyDownHandler(event, o.getID());
				});
				o.render();
			});
		});

		CustomEvent.observe("mi.addToExisting.associate", function(answer) {
			if (answer) {
				var ans = answer[0];
				var url = new GlideURL('incident.do');
				url.addParam('sys_id', ans.getAttribute('incidentId'));
				var incidentLink = "<a href=" + url.getURL() + ">" + ans.getAttribute('displayValue') + "</a>";
				GlideUI.get().addOutputMessage({
					msg: new GwtMessage().getMessage('Selected {0} were added as child Incidents to Major Incident {1}', title, incidentLink),
						type: "info"
					});
				}
				var checkedIds = incidents.split(',');
				for (var i = 0; i < checkedIds.length; i++)
					$('check_' + listID + '_' + checkedIds[i]).checked = false;
				$("allcheck_" + listID).checked = false;
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
