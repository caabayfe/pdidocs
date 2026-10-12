if (gs.hasRole('maint')) {
    answer = true;
} else if (gs.hasRole('events_admin')) {
    if(gs.getProperty('com.glide.processing.framework.enabled', 'true') == 'false') {
        gs.addErrorMessage(gs.getMessage('The processing framework feature is disabled.'));
        answer = false;
    } else {
        answer = true;
	}
} else {
    answer = false;
}
