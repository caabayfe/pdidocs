(function() {
	if (GlidePluginManager.isZboot())
		return;
	gs.setProperty('com.snc.incident.create_from_interaction.save', false);
})();
