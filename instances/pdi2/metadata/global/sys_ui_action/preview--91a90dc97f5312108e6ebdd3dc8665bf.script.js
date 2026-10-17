function openTableWithDomainFilter() {
	// validate form values
	var inactiveDomainSysID = g_scratchpad.domain_id;
	var tableLabel = g_form.getValue("table_name");
	if (!inactiveDomainSysID || !tableLabel) {
	  g_form.addErrorMessage(getMessage("Either Inactive Domain or table name value is incorrect or empty"));
	  return;
	}
	var filter = 'sys_domain=' + inactiveDomainSysID;
	var url = '/' + tableLabel + '_list.do?sysparm_query=' + encodeURIComponent(filter);
	window.open(url, '_blank');
}
