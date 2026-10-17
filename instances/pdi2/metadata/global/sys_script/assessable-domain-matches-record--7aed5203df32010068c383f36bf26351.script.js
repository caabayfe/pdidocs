var sourceRecord = new GlideRecord(current.source_table);
sourceRecord.get(current.source_id);
var mismatch = false;
//assessable record's domain same as source domain if source table is domain separated
if (tableHasColumn(current.source_table)) {
	if(current.metric_type.sys_domain!='global')
		mismatch = (!(new AssessmentUtils().domainsAreEqual(current.metric_type.sys_domain, sourceRecord.sys_domain)));
}
else
	mismatch = !isGlobal(current.metric_type.sys_domain);
if (mismatch) {
	gs.log('Skipping creation of related Assessable Record for '+ sourceRecord.getTableName() + ': ' + sourceRecord.getDisplayValue() + '. Incompatible domains for Assessable Source and Type - they must be in the same domain');
	current.setAbortAction(true);
}
/* Setting the domain here, as setting it in Java did not work */ 
current.sys_domain = sourceRecord.sys_domain; 

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
