function endConference() {
	var activeCall = new GlideRecord('notify_conference_call');
	activeCall.addQuery('source', g_form.getUniqueValue());
	activeCall.addQuery('active', true);
	activeCall.query(activeCallBackFn);
}

function activeCallBackFn(activeCall) {
	// check if there are any active conference calls related to the current incident alert
	if (activeCall.hasNext()) {
		var dialog = new GlideModal('conference_call_end');
		getMessage("End Conference", function(msg) {
			dialog.setTitle(msg);
			dialog.setWidth(275);
			dialog.setPreference("focusTrap", true);
			dialog.render();
		});
	} else {
		getMessage("Conference already ended", function(endmsg) {
			alert(endmsg);
			window.location.reload();
		});
	}
}
