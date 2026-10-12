function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //Type appropriate comment here, and begin script below
	var col_choice = g_form.getElement('sys_select.sc_ic_question.sc_ic_column');
	var ac = new AJAXReferenceChoice(col_choice,'sc_ic_question.sc_ic_column', '', 'not_important');
	
	ac.ajaxRequest(onResponse);
	function onResponse() {
		setSelectValue(col_choice, 'sc_ic_question.sc_ic_column');
	}
}
