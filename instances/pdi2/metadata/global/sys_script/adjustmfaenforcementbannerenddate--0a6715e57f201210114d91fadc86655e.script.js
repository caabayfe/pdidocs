(function executeRule(current, previous /*null when async*/ ) {
    if(GlideSession.get().hasRole('maint')){
		gs.addErrorMessage(gs.getMessage('Maint user cannot update this property.'));
		current.setAbortAction(true);
		return;
	}
    var announcement = new GlideRecord('sys_ux_banner_announcement');
    if (!announcement.isValid())
       return;
    announcement.get('055a83bf77b01210e5415bef5b5a99d6'); //sys id of ux banner record related to admin mfa enforcement message
    announcement.query();
    if (announcement.next()) {
       if (current.value == 'true' && previous.value == 'false') {
            announcement.setValue('end', new GlideDateTime());
       } else if(current.value == 'false' && previous.value == 'true') {
            announcement.setValue('end', '');
       }
       announcement.update();
    }
})(current, previous);
