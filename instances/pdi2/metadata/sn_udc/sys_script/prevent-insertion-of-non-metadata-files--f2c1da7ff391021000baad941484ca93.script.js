(function executeRule(current, previous /*null when async*/) {
	if (
		!(
			UDCUtil.isAppRecord(current.file_table) ||
			FileTaxonomy.isMetadataFile(current.file_table)
		)
	) {
		gs.addErrorMessage(
			gs.getMessage('Only metadata files or apps can be added to a collection.')
		);
		current.setAbortAction(true);
	}
})(current, previous);
