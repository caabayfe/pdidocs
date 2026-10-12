function transform(input) {
    var suiteName = "";
    var gr = new GlideAggregate('scan_check_suite');
    gr.addQuery("sys_id", input.suite);
    gr.query();
    if (gr.next()) {
        suiteName = gr.name.getDisplayValue().toString();
    }
	return suiteName;
}
