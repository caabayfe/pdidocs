function onLoad() {
	var serviceId = g_form.getReference('application_id').service_id;
    var ajax = new GlideAjax('HermesDiagnostics');
    ajax.addParam('sysparm_name', 'getSetupStatusByServiceId');
    ajax.addParam('sysparm_service_id', serviceId);
    ajax.getXML(function(response) {
        if (!response || !response.responseXML || !response.responseXML.documentElement) {
            msg = getMessage("Unable retrieve Hermes Health Status at this time. Please review Hermes Diagnostics page for more information.");
            return confirm(msg);
        }
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var status = JSON.parse(answer);
        var msg = "";
        if (status.children.HERMES_CLUSTER_CONFIGURATION.health == "RED" && status.children.HERMES_ENABLED.health == "GREEN" || 
		status.children.HERMES_CLUSTER_CONFIGURATION.health == "RED" && status.children.HERMES_ENABLED.health == "RED") {
            msg = getMessage("Hermes is installed but isn't fully configured yet for associated service. Please review Hermes Diagnostics page for more information.");
        return confirm(msg);
        }
    });
}
