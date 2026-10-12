(function executeRule(current, previous /*null when async*/) {
	 
	if (SNC.MetadataLinkUtil.isTableMetadataLinkExempt(current.getTableName()))
		return;
	
	function overwriteMetadata(linkedRecord) {
		var payloadStr = gs.unloadRecordToXML(linkedRecord, true);
		var output = new GlideRecord('sys_metadata_link');
		output.addQuery('documentkey', linkedRecord.sys_id);
		output.addQuery('sys_scope', gs.getCurrentApplicationId());
		output.addQuery('tablename', linkedRecord.getTableName());
		output.addQuery('directory', "update");
		output.query();

		if (output.next()) {
			output.payload = payloadStr;
			output.sys_name = linkedRecord.getDisplayValue();
			return output.update();
		}

		return null;
	}
	overwriteMetadata(current);
})(current, previous);
