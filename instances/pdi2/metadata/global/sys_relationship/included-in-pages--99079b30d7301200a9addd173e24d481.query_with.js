(function refineQuery(current, parent) {
	var ids = [];
	var gr = new GlideRecord('sp_instance');
	gr.addQuery("sp_widget", parent.getUniqueValue());
	gr.query();
	while (gr.next())
		ids.push(getPage(gr.getUniqueValue()));
	current.addQuery('sys_id','IN',ids);
	
	function getPage(instID) {
		var inst = new GlideRecord("sp_instance");
		if (!inst.get(instID))
			return null;
		
		var rowGR = inst.sp_column.sp_row.getRefRecord();
		if (rowGR == null || rowGR.getUniqueValue() == null)
			return null;
		
		return getPageFromRowGR(rowGR);
	}
	
	function getPageFromRowGR(rowGR) {
		if (!rowGR.sp_container.nil())
			return rowGR.sp_container.sp_page + "";
		
		if (!rowGR.sp_column.sp_row.nil())
			return getPageFromRowGR(rowGR.sp_column.sp_row.getRefRecord());
	}
})(current, parent);
