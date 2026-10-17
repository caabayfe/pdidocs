function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   var mappingGr = new GlideRecord('knowledge_based_question_answer_mapping');
   mappingGr.addQuery('question', newValue);
   mappingGr.query();
   if(!mappingGr.hasNext()) {
		clearFieldValue(control);
		var gwt = new GwtMessage();
		g_form.showFieldMsg('question', gwt.getMessage('Selected question should have a mapping in Knowledge Based Question Answer Mapping table.'), 'error');
   }
}

function clearFieldValue(control) {
	var fieldName = 'question';
	g_form.setValue(fieldName, '');
}
