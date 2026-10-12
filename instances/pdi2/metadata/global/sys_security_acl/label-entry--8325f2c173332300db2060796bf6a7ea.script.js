answer = (function() {
	var labelGr = new GlideRecord("label");
	var tableGr = new GlideRecord(current.table);
	labelGr.setWorkflow(false);
	tableGr.setWorkflow(false);

	if (labelGr.get(current.label) && tableGr.get(current.table_key))
		return labelGr.canRead() && tableGr.canRead();

	return false;
})();
