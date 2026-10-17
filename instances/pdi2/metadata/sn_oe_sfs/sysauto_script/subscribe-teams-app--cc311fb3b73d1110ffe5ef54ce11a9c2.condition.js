answer = false;

if (!GlidePluginManager.isActive("com.glide.domain.msp_extensions.installer")) {
	var gr = new GlideRecord('sys_cs_collab_settings');
	gr.query();
	if (gr.next()) {
		answer = (gr.getValue('enable_teams') == 1);
	}
}
