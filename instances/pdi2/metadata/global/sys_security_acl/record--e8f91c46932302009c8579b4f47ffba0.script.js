answer = false;
if (gs.getProperty('glide.sm.default_mode') == 'allow') {
	if (current != null && GlidePublicPage.isPublic(current.getTableName()))
		answer = true;
}
