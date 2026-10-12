function onLoad() {
	var translatedMsg;
	if (typeof GwtMessage !== "undefined") /* For the desktop UI */
		translatedMsg = new GwtMessage().getMessage('{0} (Private)', g_form.getLabelOf('work_notes'));
	else /* For agent workspace, service portal, angular mobile app */
		translatedMsg = getMessage('{0} (Private)', g_form.getLabelOf('work_notes'));
	
	/* Do interpolation. For service portal and angular mobile app only. */
	if (translatedMsg.withValues)
		translatedMsg = translatedMsg.withValues([g_form.getLabelOf('work_notes')]);
	
	g_form.setLabelOf('work_notes', translatedMsg);
}
