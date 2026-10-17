function onLoad() {
	if (g_form.isNewRecord()) {
		var annotationToHide = gel('retrieve_annotation');
		if (annotationToHide)
			annotationToHide.style.display = 'none';
	}
}
