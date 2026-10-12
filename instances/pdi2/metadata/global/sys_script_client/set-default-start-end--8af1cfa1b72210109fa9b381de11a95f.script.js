function onSubmit() {
   
	if (!g_form.getValue("start_date")) {
		g_form.setValue("start_date", formatDate(new Date(), g_user_date_format));
	}
	
	if (!g_form.getValue("end_date")) {
		var start_date = new Date(getDateFromFormat(g_form.getValue("start_date"), g_user_date_format));
		start_date.setDate(start_date.getDate() + 31);
		g_form.setValue("end_date", formatDate(start_date, g_user_date_format));
	}
	
}
