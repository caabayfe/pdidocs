function onLoad() {
	if(g_form.getValue('simple_reference') === 'true') {
		if(SN && SN.formAnnotations) {
			var pref = SN.formAnnotations.preference;
			var infoPref = SN.formAnnotations.infoPreference;
			SN.formAnnotations.preference = false;
			SN.formAnnotations.infoPreference = false;
			CustomEvent.observe('page_loaded_fully', function restoreAnnotationPreferences() {
				SN.formAnnotations.preference = pref;
				SN.formAnnotations.infoPreference = infoPref;
			});
		}
	}
}
