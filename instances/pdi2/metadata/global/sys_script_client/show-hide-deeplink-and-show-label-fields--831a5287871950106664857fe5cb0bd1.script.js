function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		showOrHideFieldsBasedOnPosition();
		return;
	}
	showOrHideFieldsBasedOnPosition();
}

function showOrHideFieldsBasedOnPosition(){
	var positionValue = g_form.getValue('position');
	if(positionValue == 'sub_header'){
		g_form.setVisible('deeplink_to_subobject', true);
		g_form.setVisible('show_label', true);
	}
	else if(positionValue == 'content'){
		g_form.setVisible('deeplink_to_subobject', false);
		g_form.setVisible('show_label', false);
	}
	return;
}
