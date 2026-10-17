function onLoad() {
   // Empty on purpose
}

function hideEmptyScLayoutSections(styles) {
	if (typeof styles == 'undefined' || !styles)
		return;
	
	var sections = g_form.getSections();
	// ignore sections[0] which should always show
	for (i = 1; i < sections.length; i++) {
		var section = sections[i];
		var style = styles[section.id];
		if (typeof style == 'undefined' || !style) {
			// IE ids separated with a dot, key separated by dash
			var sectionId = section.id.replace('.', '-');
			style = styles[sectionId];
		}
		if (typeof style != 'undefined' && style)
			section.style.display = style;
	}
}
