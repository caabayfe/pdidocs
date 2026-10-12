function transform(input) {
    var gr = new GlideRecord(input.table);
    gr.addQuery("sys_id", input.recordId);
    gr.query();
    var gr1 = new global.ACEAppBuilderGlobalScopedUtil();
    if (gr.next()) {
       var result =  gr1.updateRecord(input.table, input.recordId, {
            active: input.active
        });
    }
	var grNew = new GlideRecord(input.table);
    grNew.addQuery("sys_id", input.recordId);
	grNew.query();
	if (grNew.next()) {
		var activeFlag = grNew.getValue('active') == '1' ? true : false;
		return activeFlag == input.active;
    }
	return false;
}
