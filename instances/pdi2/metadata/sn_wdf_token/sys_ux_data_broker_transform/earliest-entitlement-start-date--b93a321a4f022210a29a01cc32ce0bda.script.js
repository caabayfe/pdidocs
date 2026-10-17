function transform(input) {
	var WdfUtilAPI = new sn_wdf_token.WdfUtil();
	var WdfDashboardUtilAPI = new sn_wdf_token.WdfDashboardUtil();

	var earliestDate =  WdfDashboardUtilAPI.getEarliestStartDate();

	// Convert date to <Month day, year> format
	var formattedStartDate = "";
	var userLanguageCode = gs.getSession().getLanguage();
	if (earliestDate != "") {
		var gdt = new GlideDateTime(earliestDate);
		formattedStartDate = gdt.getDisplayValueLang("long", userLanguageCode).split(" ");
		formattedStartDate.pop(formattedStartDate.length - 1); // remove time value
		formattedStartDate = formattedStartDate.join(' ');
	}

	return formattedStartDate;
}
