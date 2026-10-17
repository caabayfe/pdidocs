function editVarLayout() {
    var table = "var__m_atf_input_variable_" + g_form.getUniqueValue();
    var url = "$ng_fd.do?sysparm_attributes=";
    url += encodeURIComponent('startTable:"' + table +'",startView:"Default view"');

    window.open(url, "_blank");
	return false;
}
