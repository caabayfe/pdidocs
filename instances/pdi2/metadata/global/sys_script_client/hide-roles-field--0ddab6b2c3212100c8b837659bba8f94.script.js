function onLoad() {
	var useUserCriteria = g_scratchpad.use_user_criteria + '' == 'true';
	if (useUserCriteria)
		// Hide Roles field
		g_form.setDisplay('roles', false);

	addAfterPageLoadedEvent(function () {
		var useUserCriteria = g_scratchpad.use_user_criteria + '' == 'true';
		if (useUserCriteria) {
			// Hide Roles annotation field
			var annotationRows = $$(".annotation-row");
			for (var i = 0; i < annotationRows.length; i++) {
				var row = annotationRows[i];
				if (row && row.innerHTML.indexOf('Roles') > -1)
					row.hide();
			}
		}
	});
}
