function editVarLayout() {
	var table = "var__m_" + g_form.getUniqueValue();
	var gr = new GlideRecord("var_dictionary");
	gr.addQuery("name", table);
	gr.query();
	if(!gr.next())
		 table = "var__m_wf_activity_variable_" + g_form.getUniqueValue();
    
    var url = "$ng_fd.do?sysparm_attributes=";
    url += encodeURIComponent('startTable:"' + table +'",startView:"Default view"');

    window.open(url, "_blank");
	return false;
}
