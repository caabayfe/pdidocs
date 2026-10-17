function sendUpdates() {
	var sys_id = g_form.getUniqueValue();
	try {
		var ga = new GlideAjax('CommunicationManagementUtilAjaxSNC');
		ga.addParam('sysparm_name', 'getCommTaskSourceTable');
		ga.addParam('sysparm_comm_task', sys_id);
		ga.getXML(function(response) {
			var sourceTable = response.responseXML.documentElement.getAttribute("answer");
			if(sourceTable) {
				var short_description = g_form.getValue('short_description');
				var dialog = getDefaultGlideModal("task_communication", short_description, 800, true);
				ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
					dialog.template = glideModalTemplate;
					dialog.on('bodyrendered', function(event) {
						glideModalKeyDownHandler(event, dialog.getID());
					});
					dialog.on('beforeclose', function(event) {
						var reload = dialog.getPreference('reload');
						if(reload)
							location.reload();
					});
					dialog.renderIframe("$task_communication.do?sysparm_sys_id=" + sys_id + "&sysparm_stack=no&sysparm_table=" + sourceTable);
				});
			}
		});
	}
	catch(err) {
		console.log(err);
	}
}

function getDefaultGlideModal(name, title, width, flexiableHeight) {
	if (!name)
		return;
	var modal = new GlideModal(name);
	modal.setTitle(title);
	modal.setWidth(width ? width : 1200);
	if(!flexiableHeight)
		modal.setAutoFullHeight(true);
	return modal;
}
