function showConfirmModal() {
	var gm = new GlideModal('glide_confirm_standard');
    gm.setTitle(getMessage("Confirmation"));
	gm.setPreference('title', getMessage("This shift will be upgraded to new schedule engine. Do you want to continue?"));
    gm.setPreference('warning', 'true');
    gm.setPreference('onPromptComplete', function() {
        var ga = new GlideAjax('OnCallShiftAjax');
		ga.addParam('sysparm_name', 'upgradeShiftToNewScheduleEngine');
		ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
		ga.getXML(function() {
			location.reload();
		});
    });
    gm.render();
}
