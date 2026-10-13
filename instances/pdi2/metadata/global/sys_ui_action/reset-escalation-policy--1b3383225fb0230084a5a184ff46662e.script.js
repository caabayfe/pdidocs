function showResetConfirmationModal(){
	var modal = new GlideModal("oc_reset_escalation_policy");
	getMessage("Confirmation", function(msg) {
		modal.setTitle(msg);
		modal.setPreference('rotaSysId', g_form.getUniqueValue());
		modal.on('escalation_reset_success', function() {
			modal.destroy();
			location.reload();
		});
		modal.render();
	});
}
