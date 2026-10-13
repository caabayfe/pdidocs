function showOverrideConfirmationModal(){
	var modal = new GlideModal("oc_override_escalation_policy");
	getMessage("Confirmation", function(msg) {
		modal.setTitle(msg);
		modal.setPreference('rotaSysId', g_form.getUniqueValue());
		modal.on('escalation_override_success', function() {
			var url = "/$oc_escalation_designer.do?sysparm_stack=no&sysparm_rota_id=" + g_form.getUniqueValue();
			var gsftFrame = parent.document.getElementById('gsft_main');
			if (gsftFrame) {
				var gsftWindow = gsftFrame.contentWindow;
				gsftWindow.location.href = url;
			}
			else {
				parent.location.href = url;
			}
			modal.destroy();
			location.reload();
		});
		modal.render();
	});
}
