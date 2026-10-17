function demoteMajorIncident() {
	var demoteReason = $("mim_demote_reason_text");
	if (demoteReason && demoteReason.value) {
		getMessage("Demoted from major incident", function (msg) {
			//To be refactored after PRB1240294 is fixed
			g_form.getControl("work_notes").value = msg + "\n" + demoteReason.value.trim();
			//destroying the GlideModal rendered in ui action 'sysverb_mim_cancel'
			GlideModal.prototype.get("sn_major_inc_mgmt_mim_demote_reason").destroy();
			//Calling the ui action 'sysverb_mim_cancel' to run the function 'cancelMIOnConfirmation' 
			gsftSubmit(null, g_form.getFormElement(), "sysverb_mim_demote");
		});
	}
}

//IIFE to populate textarea with current worknote
(function() {
	var notes = g_form.getValue("work_notes");
	if(notes){
		$("mim_demote_reason_text").value = notes;
		enableButton();
	}
	if(navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0 || navigator.userAgent.indexOf('Edge') !== -1) {
		getMessage("Work notes. Reason for demoting the major incident.", function (label) {
			/* Microsoft Internet Explorer detected in. */
			$("mim_demote_reason_text").setAttribute('aria-label', label);
			$("mim_demote_reason_text").setAttribute('aria-required', true);
		});
	}
	GlideModal.prototype.get('sn_major_inc_mgmt_mim_demote_reason').on('beforeclose', function() {
		$j('.tooltip').hide().tooltip('hide');
	});
})();
