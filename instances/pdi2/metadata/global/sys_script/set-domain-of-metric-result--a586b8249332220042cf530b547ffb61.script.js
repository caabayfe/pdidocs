(function executeRule(current, previous /*null when async*/) {
	// metric result domain = assessable record domain
	//if assessable record's record is not domain separated, metric result domain = category domain if is global
	var sourceRecord = new GlideRecord(current.source_table);
	sourceRecord.get(current.source_id);
	
	if (tableHasColumn(current.source_table))
		current.sys_domain = sourceRecord.sys_domain;
	else if (isGlobal(current.metric.sys_domain))
		current.sys_domain = current.metric.sys_domain;
	function tableHasColumn(tableName) {
		var gr = new GlideRecord(tableName);
		gr.initialize();
		var ge = gr.getElement("sys_domain");
		return ge != null;
	}
	function isGlobal(domain) {
	if (domain.nil())
		return true;
	if (domain.indexOf("global") >= 0)
		return true;
	return false;
}
})(current, previous);
