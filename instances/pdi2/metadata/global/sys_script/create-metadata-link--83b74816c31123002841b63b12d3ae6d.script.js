(function executeRule(current, previous /*null when async*/) {
	 
	if (SNC.MetadataLinkUtil.isTableMetadataLinkExempt(current.getTableName()))
		return;
	
	function addMetadata(linkedRecord) {
		var payloadStr = gs.unloadRecordToXML(linkedRecord, true);
		var output = new GlideRecord('sys_metadata_link');
		output.payload = payloadStr;
		output.documentkey = linkedRecord.sys_id;
		output.tablename = linkedRecord.getTableName();
		output.sys_name = linkedRecord.getDisplayValue();
		output.directory = "update";
		output.insert();
	}
	addMetadata(current);
})(current, previous);
