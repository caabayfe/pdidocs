function onSubmit() {
   //Type appropriate comment here, and begin script below
	var col_choice = g_form.getElement('sys_select.sc_ic_question.sc_ic_column');
	if (col_choice)
		setSelectValue(col_choice, 'sc_ic_question.sc_ic_column');
}
