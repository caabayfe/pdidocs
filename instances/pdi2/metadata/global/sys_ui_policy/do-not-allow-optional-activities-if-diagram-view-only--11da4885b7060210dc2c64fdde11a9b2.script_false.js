function onCondition() {
	g_form.setValue('enable_optional_activities', true);
	var annotation = document.getElementById('optional_annotation');
	var parent = annotation.parentElement;
	annotation.style.visibility = 'hidden';
	annotation.style.height = '0';
	parent.style.visibility = 'hidden';
	parent.style.height = '0px';
	parent.style.padding = '0px';
	parent.style.margin = '0px';
}
