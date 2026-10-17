function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
	   return;

	 var doesCommentsExist = doesFieldExist('comments') == 'true';
	 var doesWorkNotesExist = doesFieldExist('work_notes') == 'true';
	 g_form.setDisabled('add_additional_comment_button', !doesCommentsExist);
	 g_form.setDisabled('add_work_note_button', !doesWorkNotesExist);
	 if (!doesCommentsExist)
		 g_form.setValue('add_additional_comment_button', false);

	 if (!doesWorkNotesExist)
		 g_form.setValue('add_work_note_button', false);
}

function doesFieldExist(fieldName) {
	 var ga = new GlideAjax('FieldExistanceChecker');
	 ga.addParam('sysparm_name', 'doesFieldExist');
	 ga.addParam('sysparm_parent', g_form.getValue('parent'));
	 ga.addParam('sysparm_parent_table', g_form.getValue('parent_table'));
	 ga.addParam('sysparm_field_name', fieldName);
	 ga.getXMLWait();
	 return ga.getAnswer();
}
