(function(TABLE_NAME, FIELD_NAME) {
    if (!TABLE_NAME || !FIELD_NAME) {
        return;
    }
	var gr = new GlideRecord(TABLE_NAME);
	gr.addEncodedQuery(FIELD_NAME + "ISEMPTY");
	gr.query();
	while(gr.next()) {
		gr.setValue(FIELD_NAME, (new GlideDateTime().getDisplayValue()));
		gr.update();
	}
})(TABLE_NAME, FIELD_NAME);
