function onCondition() {
	g_form.setDisplay('seo_script', true);
	g_form.setMandatory('seo_script', true);
	if (!g_form.getValue('seo_script'))
		g_form.setValue('seo_script', 'f060f7b377011010d81e7811a91061e3', 'SPSEOHeaderTags');
}
