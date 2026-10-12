function onCondition() {
	g_form.setValue('enable_optional_activities', false);
	var annotation = document.getElementById('optional_annotation');
	var parent = annotation.parentElement;
	annotation.style.visibility = 'visible';
	annotation.style.height = 'auto';
	parent.style.visibility = 'visible';
	parent.style.height = 'auto';
	parent.style.padding = '4px 10px';
	parent.style.margin = '6px 0px 6px 0px';
}
