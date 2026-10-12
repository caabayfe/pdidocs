function updateProperty() {
	if (GlidePluginManager.isZboot()) {
		gs.setProperty('glide.itam_update_ci_status_from_ritm', 'false');
	}
}
updateProperty();
