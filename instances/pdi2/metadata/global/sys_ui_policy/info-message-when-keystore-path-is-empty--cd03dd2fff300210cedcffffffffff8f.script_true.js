function onCondition() {

	g_form.showFieldMsg(
			'keystore_path', 
			getMessage("When keystore path is empty, mutual authentication configuration is read from the MID server's config.xml parameters instead"),
			'info',
			false
		);
}
