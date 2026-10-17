if (cancelled == "false" && new_ci != "") {
	new AssetandCI().mergeCI(ci, new_ci);
	response.sendRedirect("cmdb_ci.do?sys_id=" + new_ci);
} else
	response.sendRedirect("cmdb_ci.do?sys_id=" + ci);
