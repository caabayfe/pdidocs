var rotaSysId = "";
var glideModal;
function resetEscalation() {
	var ga = new GlideAjax('OnCallWorkbenchUtilsAjax');
	ga.addParam('sysparm_name', 'resetEscalation');
	ga.addParam('sysparm_rota_sys_id', rotaSysId);
	ga.getXML(function(response) {
		glideModal.fireEvent('escalation_reset_success');
	});
}
function initResetEscalation() {
	glideModal = GlideModal.prototype.get('oc_reset_escalation_policy');
	rotaSysId = glideModal.getPreference('rotaSysId');
}
initResetEscalation();
