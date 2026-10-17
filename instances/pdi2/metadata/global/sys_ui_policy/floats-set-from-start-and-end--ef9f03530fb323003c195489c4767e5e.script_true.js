function onCondition() {
    if (g_form.getValue('float_start') != "") {
	  g_form.setValue('start', g_form.getValue('float_start'));
	  g_form.setValue('end', g_form.getValue('float_end'));
    }
}
