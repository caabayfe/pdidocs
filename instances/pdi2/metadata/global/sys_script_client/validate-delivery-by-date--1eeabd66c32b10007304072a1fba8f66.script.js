function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;

	// send date information to server for validation
	var dtAjax = new GlideAjax('TransferOrderDateTimeAjax');
	dtAjax.addParam('sysparm_name', 'compareDatesAjax');
	dtAjax.addParam('sysparm_startDate', g_form.getValue('delivery_by_date'));
	dtAjax.addParam('sysparm_endDate', Date());
	dtAjax.getXMLAnswer(function(answer) {
	    var isDateBefore = answer;
	    if (isDateBefore == 'true')
		    g_form.showFieldMsg('delivery_by_date', getMessage('Choose a delivery date in the future'), 'error', true);
	});
}
