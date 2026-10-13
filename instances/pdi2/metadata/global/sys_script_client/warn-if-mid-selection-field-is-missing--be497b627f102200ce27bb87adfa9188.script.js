function onLoad() {
	if ((g_form.getValue('mid_select_method')) == '' && !g_scratchpad.expressPluginActive)
	   g_form.addErrorMessage('The field \'MID Server selection method\' needs to be added to the form.  This field is required to define how MID Servers are selected.');
}
