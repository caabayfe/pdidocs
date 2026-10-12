if (gs.hasRole('maint')) {
    answer = true;
} else if (gs.hasRole('events_admin')) {
    if(gs.getProperty('com.glide.processing.framework.enabled', 'true') == 'false') {
        answer = false;
    } else {
        answer = true;
	}
} else {
    answer = false;
}
