function onCondition() {
	if (g_form.getValue('length') < '0' && g_form.getValue('length') != '') {
		g_form.setValue('length', '');
		g_form.showErrorBox('length',getMessage("Length must be a non negative value."));
    }
	if (g_form.getValue('width') < '0' && g_form.getValue('width') != '') {
		g_form.setValue('width', '');
		g_form.showErrorBox('width',getMessage("Width must be a non negative value."));
    }
	if (g_form.getValue('height') < '0' && g_form.getValue('height') != '') {
		g_form.setValue('height', '');
		g_form.showErrorBox('height',getMessage("Height must be a non negative value."));
    }
  if (g_form.getValue('depth') < '0' && g_form.getValue('depth') != '') {
		g_form.setValue('depth', '');
		g_form.showErrorBox('depth',getMessage("Depth must be a non negative value."));
    }
	if (g_form.getValue('current') < '0' && g_form.getValue('current') != '') {
		g_form.setValue('current', '');
		g_form.showErrorBox('current',getMessage("Current must be a non negative value."));
    }
	if (g_form.getValue('rated_power') < '0' && g_form.getValue('rated_power') != '') {
		g_form.setValue('rated_power', '');
		g_form.showErrorBox('rated_power',getMessage("Rated Power must be a non negative value."));
    }
	if (g_form.getValue('voltage') < '0' && g_form.getValue('voltage') != '') {
		g_form.setValue('voltage', '');
		g_form.showErrorBox('voltage',getMessage("Voltage must be a non negative value."));
    }
	if (g_form.getValue('volume') < '0' && g_form.getValue('volume') != '') {
		g_form.setValue('volume', '');
		g_form.showErrorBox('volume',getMessage("Volume must be a non negative value."));
    }
	if (g_form.getValue('weight_decimal') < '0' && g_form.getValue('weight_decimal') != '') {
		g_form.setValue('weight_decimal', '');
		g_form.showErrorBox('weight_decimal',getMessage("Weight must be a non negative value."));
    }
}
