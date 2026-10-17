function transform(input) {
	var date = new GlideDateTime();
	date.addDaysUTC(-367);
	return date.getDate().toString();
}
