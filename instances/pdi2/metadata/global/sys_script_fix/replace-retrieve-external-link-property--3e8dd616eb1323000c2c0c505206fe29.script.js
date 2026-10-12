var oldProperty = new GlideRecord('sys_properties');
if (oldProperty.get('fa1adf46d733020023c84f80de610361')) {
	var dscrp = 'DEPRECATED, use \"glide.ui.url.external\" and "glide.ui.url.external.content" instead';
	if (oldProperty.getValue('description') != dscrp) {
		oldProperty.setValue('description', dscrp);
		oldProperty.update();

		var newExternalURLProperty = new GlideRecord('sys_properties');
		newExternalURLProperty = oldProperty;
		newExternalURLProperty.name = 'glide.ui.url.external';
		var URLDscrpt = 'Enable Connect to render external links';
		newExternalURLProperty.description = URLDscrpt;
		newExternalURLProperty.insert();

		var newExternalContentProperty = new GlideRecord('sys_properties');
		newExternalContentProperty = oldProperty;
		newExternalContentProperty.name = 'glide.ui.url.external.content';
		var contentDscrpt = 'Enable Connect to retrieve external link metadata in order to render richer content in messages with links to Youtube, news articles, images, etc.';
		newExternalContentProperty.description = contentDscrpt;
		newExternalContentProperty.insert();
	}
}
