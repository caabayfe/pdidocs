if (cancelled == "false") {
	var gr = new GlideRecordSecure("sys_db_object");
	gr.get(sys_db_object);
	
	var retStr = new SNC.Rating().createRating(gr.name, true, true, false);
	response.sendRedirect("asmt_metric_type.do?sys_id=" + retStr + "&sysparm_view=ratings");
} else {
	response.sendRedirect("asmt_metric_type.list?sysparm_view=ratings");
}
