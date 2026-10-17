var rotaSysId = "";
var glideModal;
function overrideEscalation() {
	var ga = new GlideAjax('OnCallWorkbenchUtilsAjax');
	ga.addParam('sysparm_name', 'overrideEscalation');
	ga.addParam('sysparm_rota_sys_id', rotaSysId);
	ga.getXML(function(response) {
		glideModal.fireEvent('escalation_override_success');
	});
}
function initOverrideEscalation() {
	glideModal = GlideModal.prototype.get('oc_override_escalation_policy');
	rotaSysId = glideModal.getPreference('rotaSysId');
}
initOverrideEscalation();
