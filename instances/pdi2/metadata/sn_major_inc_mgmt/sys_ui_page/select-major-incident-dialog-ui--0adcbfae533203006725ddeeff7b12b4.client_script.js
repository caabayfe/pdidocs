function actionOK() {
	if ($("incident_sysid").value.length > 0) {
		$('ok_button').disabled = true;
		$('cancel_button').disabled = true;
		var glideAjax = new GlideAjax("sn_major_inc_mgmt.MIMListActionsUtil");
		glideAjax.addParam("sysparm_name", "addManyRelatedAjax");
		glideAjax.addParam("sysparm_task_sys_id", $("incident_sysid").value);
		glideAjax.addParam("sysparm_selected_incidents", $("selected_incidents").value);
		glideAjax.getXML(function(answer) {
			answer = answer.responseXML.getElementsByTagName("result");
			CustomEvent.fireAll("mi.addToExisting.associate", answer);
		});
	}
}

function enableButton() {
if ($("incident_sysid").value.length > 0)
		$('ok_button').removeClassName("disabled");
	else
		$('ok_button').addClassName("disabled");

}

function actionCancel() {
	CustomEvent.fireAll("mi.addToExisting.cancel");
}
