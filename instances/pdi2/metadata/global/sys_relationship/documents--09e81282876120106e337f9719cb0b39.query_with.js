(function refineQuery(current, parent) {
	var refGR = new GlideRecord('ds_document_references');
	refGR.addQuery('table_name',parent.getRecordClassName());
	refGR.addQuery('target_record',parent.sys_id);
	refGR.query();
	
	var sysIds = "";
	while(refGR.next()) {
		sysIds = sysIds + refGR.document.sys_id + "," ;
	}
	sysIds = sysIds.substring(0,sysIds.length-1);
	current.addQuery('sys_id','IN',sysIds);
})(current, parent);
