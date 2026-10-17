function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  
	var gsftFrame = parent.document.getElementById('gsft_main');
	var gsftWindow;
	if (gsftFrame) {
		gsftWindow = gsftFrame.contentWindow || gsftFrame.contentDocument;
	}
	else {
		gsftWindow = parent;
	}
	
	var annotationMessageSpan = gsftWindow.document.getElementsByClassName('next-day-message')[0];
	if (annotationMessageSpan) {
		var annotationWrapper = annotationMessageSpan.parentElement;

		if (g_form.getValue('schedule_type') == 'simple') {
			annotationWrapper.style.display = 'block';
		}
		else {
			annotationWrapper.style.display = 'none';
		}
	}
}
