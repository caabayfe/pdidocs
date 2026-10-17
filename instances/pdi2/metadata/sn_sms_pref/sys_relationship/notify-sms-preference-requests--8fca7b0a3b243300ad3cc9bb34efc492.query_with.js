(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	var grNotifyNumbers = new GlideRecord("notify_number");
	grNotifyNumbers.addEncodedQuery("owner=" + parent.getValue("provider"));
	grNotifyNumbers.query();
	
	var query = "from_numberIN";
	while (grNotifyNumbers.next()) {
		query = query + grNotifyNumbers.getValue("number") + ",";
	}
	
	current.addEncodedQuery(query);
	current.orderBy("phone_number");
	current.orderBy("from_number");
	current.orderByDesc("sys_created_on");
	
})(current, parent);
