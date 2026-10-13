function onLoad() {
	if (g_form.getValue('catch_all_wait_time')) {
		// Hide the annotation
		$('cawt_annotation').up().hide();
	}
	else {
		// Show the annotation
		$('cawt_annotation').up().show();
	}
}
