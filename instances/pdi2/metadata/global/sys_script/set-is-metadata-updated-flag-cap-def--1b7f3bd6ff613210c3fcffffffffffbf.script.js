(function executeRule(current, previous /*null when async*/) {
	// lookup the current record being inserted or updated. if it is part of the packages 
	// that need to be sent to Mosaic, set the "Is Metadata Updated" flag to 
	// true. scheduled job will look at this flag and sends the metadata to Mosaic
	sn_one_extend.GenerativeAIUtility.setIsMetadataUpdatedFlag('sys_one_extend_capability_defintion', current.sys_id);
})(current, previous);
