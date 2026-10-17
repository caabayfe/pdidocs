/*
 * This method checks whether a user can read the document
 * that is being approved.
 */
function hasAccessToDocument(approvalGlideRecord){
	var table = approvalGlideRecord.source_table;
	var id = approvalGlideRecord.document_id;
	if (!JSUtil.nil(table) && !JSUtil.nil(id)) {
		var gr = new GlideRecord(table);
		if (gr.get(id) && (gr.canRead() || gr.canWrite() || gr.canCreate()))
			return true;
	} else if (!JSUtil.nil(approvalGlideRecord.sysapproval)) {
		var gr = new GlideRecord('task');
		if (gr.get(approvalGlideRecord.sysapproval) && (gr.canRead() || gr.canWrite() || gr.canCreate()))
			return true;
	}
	
	return false;
}
