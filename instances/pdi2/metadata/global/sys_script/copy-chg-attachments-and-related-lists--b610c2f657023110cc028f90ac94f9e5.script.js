(function executeRule(current, previous /*null when async*/) {
	var changeUtils = new global.ChangeUtils();
	if (changeUtils.hasReadWriteAccess()) {
			changeUtils.copyChangeAttachments(current.getValue('copied_from'), current.getUniqueValue());
			var answer = changeUtils.copyChangeRelatedLists(current.getValue('copied_from'), current.getUniqueValue());
			if (!answer)
				gs.log('Copy Chg attachments and related lists - BR - CopyChangeRelatedLists - Warnings present in ChangeUtils.copyChangeRelatedLists:' + current.number + ' / ' + current.getUniqueValue());
	}
})(current, previous);
